// might convert to an interface if can't figure out how to
// refactor StringTable to properly use BinaryString
export class BinaryString {
    private length: number;
    private offset: number;

    constructor(l: number, o: number) {
        this.length = l;
        this.offset = o;
    }
}