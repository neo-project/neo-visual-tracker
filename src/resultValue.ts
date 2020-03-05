const bs58check = require('bs58check');

export class ResultValue {
    public readonly asInteger: string;
    public readonly asByteArray: string;
    public readonly asString: string;
    public readonly asAddress: string;
    constructor(result: any) {
        let value = result.value;
        if ((value !== null) && (value !== undefined)) {
            if (value.length === 0) {
                value = '00';
            }
            this.asByteArray = '0x' + value;
            const buffer = Buffer.from(value, 'hex');
            this.asString = buffer.toString();
            this.asAddress = '';
            if (value.length === 42) {
                this.asAddress = bs58check.encode(buffer);
            }
            buffer.reverse();
            this.asInteger = BigInt('0x' + buffer.toString('hex')).toString();
        } else {
            this.asInteger = '0';
            this.asByteArray = '(empty)';
            this.asString = '(empty)';
            this.asAddress = '(empty)';
        }
    }
}