async function compressBlob(blob: Blob): Promise<Blob> {
    // @ts-ignore
    const cs: any = new CompressionStream("gzip");
    const compressedStream = blob.stream().pipeThrough(cs);
    return await new Response(compressedStream).blob();
}

export async function compressStringToBlob(str: string): Promise<Blob> {
    console.time("compressString");
    const blob = new Blob([str], { type: "text/plain" });
    const compressed = await compressBlob(blob);
    console.timeEnd("compressString");
    return compressed;
}
