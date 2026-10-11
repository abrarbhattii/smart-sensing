/** Extract a YouTube video id from common share / watch / embed URLs. */
function youtubeId(url) {
    const value = String(url).trim();
    const patterns = [
        /(?:youtube\.com\/watch\?(?:[^#]*&)?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/|youtube\.com\/v\/|youtu\.be\/)([\w-]{11})/i,
        /youtube\.com\/watch\?.*\bv=([\w-]{11})/i,
    ];
    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match)
            return match[1];
    }
    return null;
}

/** YouTube / Vimeo watch URLs → embeddable iframe src, or null. */
export function videoEmbedUrl(url) {
    if (!url)
        return null;
    const value = String(url).trim();
    const yt = youtubeId(value);
    if (yt)
        return `https://www.youtube.com/embed/${yt}`;
    const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeo)
        return `https://player.vimeo.com/video/${vimeo[1]}`;
    // Already an embed URL, or a direct media file
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(value))
        return value;
    return null;
}

export function isVideoUrl(url) {
    if (!url)
        return false;
    return Boolean(videoEmbedUrl(url)) || /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

/** Force download on Supabase public Storage URLs. */
export function downloadHref(url) {
    if (!url)
        return '';
    if (!/\/storage\/v1\/object\/public\//.test(url) || /[?&]download\b/.test(url))
        return url;
    return `${url}${url.includes('?') ? '&' : '?'}download=`;
}
