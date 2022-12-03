import moment from "moment";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getSessionQueue, QueuedSessionType } from "./helpers/sessionQueue";

function extractSessionDisplayData(data: QueuedSessionType): string | null {
    try {
        const titleExtractions = data.recording.events
            .reduce((acc: any[], item) => {
                if (item.type === 4 || acc.length === 0) {
                    acc.push([]);
                }
                console.log(acc[acc.length - 1]);
                acc[acc.length - 1].push(item);
                return acc;
            }, [])
            .map((events: any[]) => {
                let titles = [];
                for (let i = 0; i < events.length; i++) {
                    const event = events[i];
                    if (event.type === 4) {
                    } else if (event.type === 3) {
                        const addedTitle = event?.data?.adds?.find(
                            (item: any) => item?.node?.tagName === "title"
                        );
                        if (addedTitle) {
                            titles.push([addedTitle, event.timestamp, 3]);
                        }
                    } else if (event.type === 2) {
                        const title = event?.data?.node?.childNodes
                            ?.find((item: any) => item?.tagName === "html")
                            ?.childNodes?.find(
                                (item: any) => item?.tagName === "head"
                            )
                            ?.childNodes?.find(
                                (item: any) => item?.tagName === "title"
                            );

                        titles.push([title, event.timestamp, 2]);
                    }
                }

                return titles;
            })
            .flat();

        const titles = titleExtractions.map(
            ([titleObj, titleTs, titleSourceType], index: number) => {
                const title = titleObj?.childNodes?.[0]?.textContent;
                const duration =
                    index === titleExtractions.length - 1
                        ? data.metadata.endTs - titleTs
                        : titleExtractions[index + 1][1] - titleTs;

                return [title, duration];
            }
        );

        return titles.slice().sort((a: any, b: any) => {
            return b[1] - a[1];
        })[0][0];
    } catch (e) {
        console.error(e);
        return null;
    }
}

const Popup = () => {
    const [count, setCount] = useState(0);
    const [currentURL, setCurrentURL] = useState<string>();

    useEffect(() => {
        chrome.action.setBadgeText({ text: count.toString() });
    }, [count]);

    useEffect(() => {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                setCurrentURL(tabs[0].url);
            }
        );
    }, []);

    const changeBackground = () => {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                const tab = tabs[0];
                if (tab.id) {
                    chrome.tabs.sendMessage(
                        tab.id,
                        {
                            color: "#555555",
                        },
                        (msg) => {
                            console.log("result message:", msg);
                        }
                    );
                }
            }
        );
    };

    const [sessionQueue, setSessionQueue] = useState<
        QueuedSessionType[] | null
    >(null);
    useEffect(() => {
        getSessionQueue().then((queue) => {
            setSessionQueue(queue);
        });
    }, []);
    useEffect(() => {
        const count = sessionQueue?.length || 0;
        chrome.action.setBadgeText({ text: count ? count.toString() : "" });
    }, [sessionQueue?.length]);

    return (
        <div className="flex flex-col w-full h-full bg-gray-50">
            <div className="w-full h-16 border-gray-300 border-b bg-white">
                <div className="flex flex-row justify-center items-center unselectable">
                    <img
                        src="/logo-72x72.png"
                        className="inline-block w-9 h-9 mr-3"
                    />
                    <h1 className="font-mono h-16 text-xl flex flex-row items-center">
                        OpenActionData
                    </h1>
                </div>
            </div>
            {sessionQueue && sessionQueue.length > 0 ? (
                <div className="flex-1 pt-8 px-12">
                    <h2 className="text-4xl mb-8">
                        We've identified{" "}
                        <span className="text-teal-500 font-semibold">
                            {sessionQueue.length} sessions
                        </span>{" "}
                        that could be useful for OpenActionData
                    </h2>
                    {sessionQueue.map((item) => {
                        const title = extractSessionDisplayData(item);

                        return (
                            <div
                                key={item.metadata.startTs}
                                className="w-full h-18 mb-4 rounded-3xl bg-white border-gray-300 border flex flex-row items-center unselectable cursor-pointer"
                                onClick={() => {
                                    setCount(count + 1);
                                }}
                            >
                                <div className="w-10 h-10 rounded-lg border border-gray-300 ml-6 flex justify-center items-center">
                                    <img
                                        // TODO: extract favicon
                                        src="/icon.png"
                                        className="w-8 h-8 rounded"
                                    />
                                </div>
                                <div className="flex flex-col h-10 justify-around flex-1 ml-4">
                                    <div className="text-base leading-none">
                                        {title}
                                    </div>
                                    <div className="text-base leading-none text-gray-400">
                                        {/* Nov 19, 12:54 - 13:58 */}
                                        {moment(
                                            new Date(item.metadata.startTs || 0)
                                        ).format("MMM D, HH:mm")}{" "}
                                        -{" "}
                                        {moment(
                                            new Date(item.metadata.endTs || 0)
                                        ).format("HH:mm")}
                                    </div>
                                </div>
                                <div className="material-icons mr-6">
                                    arrow_forward
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 text-4xl">Nothing to see</div>
            )}
        </div>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
    document.getElementById("root")
);
