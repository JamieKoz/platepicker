export function capitalizeFirstLetter(val: string): string {
    return val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
}
