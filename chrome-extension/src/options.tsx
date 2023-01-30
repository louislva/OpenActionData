import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ReactJson from "react-json-view";
import { RecordingType } from "./helpers/recording";
import { getQueue, SessionType } from "./helpers/sessionQueue";

const useQueryParams = () => {
    const [params, setParams] = useState<URLSearchParams>(
        new URLSearchParams(window.location.search)
    );

    useEffect(() => {
        const handler = () => {
            setParams(new URLSearchParams(window.location.search));
        };
        window.addEventListener("popstate", handler);
        return () => window.removeEventListener("popstate", handler);
    }, []);

    return params;
};

const useSessionByUuid = (
    openedSessionUuid: string
): [SessionType, RecordingType] | [null, null] => {
    const [openedSession, setOpenedSession] = useState<SessionType | null>(
        null
    );
    const [openedSessionRecording, setOpenedSessionRecording] =
        useState<RecordingType | null>(null);

    useEffect(() => {
        getQueue("sessionQueue").then((queue: SessionType[]) => {
            setOpenedSession(
                queue.find((session) => session.uuid === openedSessionUuid) ||
                    null
            );
        });
        getQueue("recordingQueue").then((queue: RecordingType[]) => {
            setOpenedSessionRecording(
                queue.find(
                    (recording) => recording.uuid === openedSessionUuid
                ) || null
            );
        });
    }, [!!openedSessionUuid]);

    const doneLoading = openedSession && openedSessionRecording;

    return doneLoading ? [openedSession, openedSessionRecording] : [null, null];
};

const ShowUuid = (props: { uuid: string }) => {
    const [session, recording] = useSessionByUuid(props.uuid);

    const privacyJson = session && {
        sessionMetadata: session.metadata,
        recording,
    };

    return (
        <div className="p-2">
            <div className="flex flex-row items-center mb-2">
                <div className="flex-1 text-base border-r pr-2 mr-2">
                    Here are the contents of <span>data.json</span>:
                </div>
                <button className="px-2 py-1 rounded bg-white border shadow text-black text-base flex flex-row items-center" onClick={() => {
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(new Blob([JSON.stringify(privacyJson, null, 2)], {type: "application/json"}));
                    a.download = "data.json";
                    a.click();
                }}>Download<span className="material-icons ml-1">download</span></button>
            </div>
            {privacyJson && (
                <div className="bg-zinc-200 p-2 rounded-lg">
                    <ReactJson
                        src={privacyJson}
                        collapsed
                        style={{
                            fontSize: "0.8rem",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

const Options = () => {
    const params = useQueryParams();
    const showUuid: string | null = params.get("show");

    return showUuid ? <ShowUuid uuid={showUuid} /> : <div>no uuid</div>;
};

ReactDOM.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>,
    document.getElementById("root")
);
