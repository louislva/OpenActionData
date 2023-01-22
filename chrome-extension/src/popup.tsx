import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
    deleteSessionByUuid,
    getQueue,
    SessionType,
} from "./helpers/sessionQueue";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import { RecordingType } from "./helpers/recording";
import { uploadQueuedSession } from "./helpers/upload";

const Popup = () => {
    const [_sessionQueue, setSessionQueue] = useState<SessionType[] | null>(
        null
    );
    const sessionQueue = useMemo(
        () => _sessionQueue?.reverse() || null,
        [_sessionQueue]
    );
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

    useEffect(() => {
        getQueue("sessionQueue").then((queue: SessionType[]) => {
            setSessionQueue(queue);
        });
    }, [!!openedSession]);

    const [openedSessionRecording, setOpenedSessionRecording] =
        useState<null | RecordingType>(null);
    useEffect(() => {
        setOpenedSessionRecording(null);
        if (openedSession?.uuid) {
            getQueue("recordingQueue").then((queue: RecordingType[]) => {
                const recording = queue.find(
                    (item) => item.uuid === openedSession.uuid
                );
                if (recording) setOpenedSessionRecording(recording);
            });
        }
    }, [openedSession?.uuid]);

    return (
        <div className="flex flex-col w-full h-full bg-gray-50">
            <div
                className="w-full h-16 border-gray-300 border-b bg-white cursor-pointer"
                onClick={() => {
                    setOpenedSessionUuid(null);
                }}
            >
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
                <SessionPage
                    openedSession={openedSession}
                    openedSessionRecording={openedSessionRecording}
                    reject={async () => {
                        // TODO: error handling
                        await deleteSessionByUuid(openedSession.uuid);
                        setOpenedSessionUuid(null);
                    }}
                    submit={async (description: string) => {
                        if (openedSession && openedSessionRecording) {
                            await uploadQueuedSession(
                                openedSession,
                                openedSessionRecording,
                                description
                            );
                            setOpenedSessionUuid(null);
                        } else {
                            // TODO: sentry
                        }
                    }}
                />
            ) : (
                <ListPage
                    sessionQueue={sessionQueue}
                    openQueuedSession={(session: SessionType) => {
                        console.log({ session });

                        setOpenedSessionUuid(session.uuid);
                    }}
                />
            )}
        </div>
    );
};

const ReplayRecording = (props: { recording: RecordingType }) => {
    const { recording } = props;
    const replayFrameRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (replayFrameRef.current && recording) {
            // when the iframe is loaded, we can start replaying the recording
            replayFrameRef.current.onload = () => {
                const html =
                    replayFrameRef.current?.contentDocument?.documentElement;
                // delete body, otherwise it renders weird
                html?.removeChild(html?.lastChild!);

                // Show the rrweb player!
                const rrPlayer = new rrwebPlayer({
                    // @ts-ignore
                    target: html,
                    props: {
                        events: recording.events,
                        width: replayFrameRef.current?.clientWidth,
                        height:
                            (replayFrameRef.current?.clientHeight || 200) - 80,
                    },
                });
                return () => {
                    rrPlayer.pause();
                };
            };
        }
    }, [!!recording]);

    return (
        <iframe
            src="replay.html"
            allowFullScreen
            className="w-full h-full overflow-hidden rounded-md shadow-lg mb-4"
            ref={replayFrameRef}
        />
    );
};

const SessionPage = (props: {
    openedSession: SessionType;
    openedSessionRecording: RecordingType | null;
    reject: () => void;
    submit: (description: string) => Promise<void>;
}) => {
    const { openedSession, openedSessionRecording, reject, submit } = props;
    const [page, setPage] = useState<"0-review" | "1-description">("0-review");
    const [description, setDescription] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    return openedSessionRecording ? (
        page === "0-review" ? (
            <div className="flex-1 pt-8 px-12">
                <h2 className="text-4xl mb-2">Review anonymized recording</h2>
                <p className="text-base mb-2">
                    Our bot has erased every mention of your personally
                    identifiable details it could find. The values it looks for
                    are: your name, phone number, email address, any password,
                    and more. It’s not flawless however, so make sure to double
                    check:
                </p>
                <div className="w-full h-screen py-8">
                    <ReplayRecording recording={openedSessionRecording} />
                </div>
                <div className="flex flex-row justify-between mb-10">
                    <button
                        className="bg-white border-2 border-zinc-500 text-zinc-500 text-base py-2 px-3 rounded-lg flex flex-row items-center"
                        onClick={() => {
                            reject();
                        }}
                    >
                        <div className="material-icons mr-2 text-xl">
                            delete
                        </div>
                        Delete
                    </button>
                    <button
                        className="bg-white border-2 border-teal-500 text-teal-500 text-base py-2 px-3 rounded-lg flex flex-row items-center justify-center w-24"
                        onClick={() => {
                            setPage("1-description");
                        }}
                    >
                        Next
                        <div className="material-icons ml-2 text-xl">
                            arrow_forward
                        </div>
                    </button>
                </div>
            </div>
        ) : (
            <div className="flex-1 pt-8 px-12 flex flex-col">
                <h2 className="text-4xl mb-2">
                    Write a description (optional)
                </h2>
                <p className="text-base mb-4">
                    If you wanted an AI assistant to do the same as you did,
                    what would you tell it?
                </p>
                <div className="flex-1">
                    <textarea
                        className="w-96 h-36 bg-white border border-zinc-300 rounded-lg mb-4 text-base p-4 resize-none"
                        placeholder="Go to Facebook and wish my grandmother a happy birthday... Approve Geoffrey’s pull request on Github... Send my boss a good excuse for being late..."
                        onChange={(e) => {
                            setDescription(e.target.value);
                        }}
                        value={description}
                    />
                </div>
                <div className="flex flex-row items-center mb-10">
                    <div className="flex-1 text-base pr-2">
                        By pressing “Submit!” you acknowledge that you’re
                        entering this recording into the public domain, and
                        loose all rights bla bla bla.
                    </div>
                    <button
                        className={
                            (submitting ? "bg-teal-500/70" : "bg-teal-500") +
                            " text-white text-base py-3 px-4 rounded-lg flex flex-row items-center ml-2 justify-center w-24"
                        }
                        onClick={async () => {
                            // TODO: try / catch + sentry + error message
                            if (!submitting) {
                                setSubmitting(true);
                                await submit(description).catch(() => null);
                                setSubmitting(false);
                            }
                        }}
                    >
                        {submitting ? "..." : "Submit!"}
                    </button>
                </div>
            </div>
        )
    ) : (
        <div className="flex justify-center items-center flex-1 text-2xl">
            Loading...
        </div>
    );
};

const ListPage = (props: {
    sessionQueue: SessionType[] | null;
    openQueuedSession: (session: SessionType) => void;
}) => {
    const { sessionQueue, openQueuedSession } = props;

    return (
        <>
            {sessionQueue ? (
                sessionQueue.length > 0 ? (
                    <div className="flex-1 pt-8 px-12">
                        <h2 className="text-4xl mb-8">
                            We've identified{" "}
                            <span className="text-teal-500 font-semibold">
                                {sessionQueue.length} sessions
                            </span>{" "}
                            that could be useful for OpenActionData
                        </h2>
                        {sessionQueue.map((item, index) => {
                            const title =
                                item.metadata.inferredTitle ||
                                "Unidentified session | " +
                                    moment(item.metadata.startTs).calendar();

                            const palette = [
                                "bg-red-200",
                                "bg-orange-200",
                                "bg-yellow-200",
                                "bg-lime-200",
                                "bg-green-200",
                                "bg-emerald-200",
                                "bg-teal-200",
                                "bg-cyan-200",
                                "bg-sky-200",
                                "bg-blue-200",
                                "bg-indigo-200",
                                "bg-violet-200",
                                "bg-purple-200",
                                "bg-fuchsia-200",
                                "bg-pink-200",
                                "bg-rose-200",
                            ];
                            const color = palette[index % palette.length];

                            return (
                                <div
                                    key={item.metadata.startTs}
                                    className="w-full h-18 mb-4 rounded-3xl bg-white border-gray-300 border flex flex-row items-center unselectable cursor-pointer"
                                    onClick={() => {
                                        console.log("TOOO");

                                        openQueuedSession(item);
                                    }}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-lg ${color} ml-6 flex justify-center items-center`}
                                    >
                                        {/* <img
                                            // TODO: extract favicon
                                            src="/icon.png"
                                            className="w-8 h-8 rounded"
                                        /> */}
                                    </div>
                                    <div className="flex flex-col h-10 justify-around flex-1 ml-4">
                                        <div className="text-base leading-none">
                                            {title}
                                        </div>
                                        <div className="text-base leading-none text-gray-400">
                                            {/* Nov 19, 12:54 - 13:58 */}
                                            {moment(
                                                new Date(
                                                    item.metadata.startTs || 0
                                                )
                                            ).format("MMM D, HH:mm")}{" "}
                                            -{" "}
                                            {moment(
                                                new Date(
                                                    item.metadata.endTs || 0
                                                )
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
                    <div className="flex justify-center items-center flex-1 text-2xl">
                        Nothing to see yet.
                    </div>
                )
            ) : (
                <div className="flex justify-center items-center flex-1 text-2xl">
                    Loading...
                </div>
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
