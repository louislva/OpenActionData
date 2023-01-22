import { RecordingType } from "./recording";
import { SessionType } from "./sessionQueue";

export default function extractSessionDisplayData(
    data: SessionType,
    recording: RecordingType
): string | null {
    try {
        const titleExtractions = recording.events
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
        console.error("Handled error:", e);
        // TODO: sentry
        return null;
    }
}
