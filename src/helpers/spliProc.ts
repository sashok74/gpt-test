export function splitString(str: string): [string, string] {
    let index = str.lastIndexOf('_'); // получаем индекс последнего символа '_'
    let firstPart = str.substring(0, index); // получаем часть строки до последнего символа '_'
    let secondPart = str.substring(index + 1); // получаем часть строки после последнего символа '_'
    return [firstPart.trim(), secondPart.trim()]; // возвращает кортеж из первой и второй части
}