import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Replayer } from "rrweb";

export default function Home(props: {}) {
    const route = useRouter();
    const [data, setData] = useState<{
        events: any[];
    } | null>(null);

    useEffect(() => {
        if(route.query.session) {
            fetch(`/api/v1/get/session/${route.query.session}`).then((response) => {
                if (response.ok) {
                    response.json().then((data) => {
                        setData(data);
                    });
                }
            });
        }
    }, [route.query.session]);

    useEffect(() => {
        if (data?.events) {
            const replayer = new Replayer(data.events, {});
            replayer.play();
        }
    }, [!!data?.events]);

    return (
        <>
            <Head>
                <title>Replay</title>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.css"
                />
                <link
                    rel="stylesheet"
                    href="/player.css"
                />
            </Head>
        </>
    );
}
