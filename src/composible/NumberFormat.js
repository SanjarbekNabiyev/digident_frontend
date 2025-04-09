export function useParsenumber(input) {
    const nums = input.replace(/(,|\$|\s)/g, "").trim();
    if (/^\d+(\.(\d+)?)?$/.test(nums)) {
        return Number(nums)
    };
    return nums === "" ? null : Number.NaN;
}

export function useFormatnumber(value) {
    if (value === null) return "";
    const formattedNumber = value.toFixed(0);
    const [integerPart, decimalPart] = formattedNumber.split(".");
    const integerWithSpaces = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    const formattedString = decimalPart ? `${integerWithSpaces}.${decimalPart}` : integerWithSpaces;
    return formattedString;
}

export function usePhoneFormat(phoneNumber) {
    if (phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, "");
        const match = cleaned.match(/^998(\d{2})(\d{3})(\d{4})$/);

        if (match) {
            return `+998 ${match[1]}  ${match[2]}  ${match[3].slice(0, 2)} ${match[3].slice(2, 4)}`;
        }

        return phoneNumber;
    }
}

export function useSummaFormat(summa){
    if(summa) return new Intl.NumberFormat('ru-RU', { style: 'decimal', minimumFractionDigits: 2 }).format(summa);
    return ""
}