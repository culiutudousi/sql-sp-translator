export function clean(script: string): string {
    return script
        .replace(/[\r\n\t]+/g,' ')
        .replace(/([(),;])/g, ' $1 ')
        .replace(/\s{2,}/g, ' ')
        .replace(/["']/g, '')
        .trim()
        .toLowerCase();
}
