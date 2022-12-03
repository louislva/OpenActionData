import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { getSessionQueue, QueuedSessionType } from "./helpers/sessionQueue";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";

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

    const [openedSessionUuid, setOpenedSessionUuid] = useState<string | null>(
        null
    );
    const openedSession = sessionQueue?.find(
        (item) => item.uuid === openedSessionUuid
    );

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
            {openedSession ? (
                <SessionPage openedSession={openedSession} />
            ) : (
                <ListPage
                    sessionQueue={sessionQueue}
                    openQueuedSession={(session: QueuedSessionType) => {
                        console.log({ session });

                        setOpenedSessionUuid(session.uuid);
                    }}
                />
            )}
        </div>
    );
};

const SessionPage = (props: { openedSession: QueuedSessionType }) => {
    const { openedSession } = props;
    const replayFrameRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (replayFrameRef.current) {
            // when the iframe is loaded, we can start replaying the recording
            replayFrameRef.current.onload = () => {
                const html =
                    replayFrameRef.current?.contentDocument?.documentElement;
                // delete body, otherwise it renders weird
                html?.removeChild(html?.lastChild!);

                // Show the rrweb player!
                new rrwebPlayer({
                    // @ts-ignore
                    target: html,
                    props: {
                        events: openedSession.recording.events,
                        width: replayFrameRef.current?.clientWidth,
                        height:
                            (replayFrameRef.current?.clientHeight || 200) - 80,
                    },
                });
            };
        }
    }, []);

    return (
        <div className="flex-1 pt-8 px-12">
            <h2 className="text-4xl mb-2">Review anonymized recording</h2>
            <p className="text-base mb-2">
                Our bot has erased every mention of your personally identifiable
                details it could find. The values it looks for are: your name,
                phone number, email address, any password, and more. It’s not
                flawless however, so make sure to double check:
            </p>
            <iframe
                src="replay.html"
                allowFullScreen
                className="w-full h-screen overflow-hidden rounded-md shadow-lg mb-2"
                ref={replayFrameRef}
            />
        </div>
    );
};

const ListPage = (props: {
    sessionQueue: QueuedSessionType[] | null;
    openQueuedSession: (session: QueuedSessionType) => void;
}) => {
    const { sessionQueue, openQueuedSession } = props;

    return (
        <>
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
                                    console.log("TOOO");

                                    openQueuedSession(item);
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
        </>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
    document.getElementById("root")
);
