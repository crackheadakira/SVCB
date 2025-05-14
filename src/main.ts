import { StringTable, type SaveInfo } from "@models";
import { jsonToSaveInfo, StardewXMLParser, type XmlObject } from "parse";
import { deserialize, serialize } from "serialize";

let XMLSaveInfo: SaveInfo | undefined;
const inputElement = document.getElementById("saveFile") as HTMLInputElement;
const buttonElement = document.getElementById("saveFileSerialize");

inputElement?.addEventListener("change", async (ev) => {
    XMLSaveInfo = await handleFiles(ev.target);
}, false);
buttonElement?.setAttribute("disabled", "true");
const uploadSerializedFileInput = document.getElementById("uploadSerializedFile");


async function handleFiles(t: EventTarget | null) {
    if (!t) return;
    const target = t as HTMLInputElement;

    const XMLData = await target.files?.item(0)?.text();
    if (!XMLData) return;

    const parser = new StardewXMLParser();
    const parsed = parser.parse(XMLData) as XmlObject;
    const saveInfo = jsonToSaveInfo(parsed.Farmer);
    buttonElement?.removeAttribute("disabled");

    console.log(parsed);
    console.log(saveInfo);
    console.log(StringTable.strings);

    return saveInfo;
}

async function handleSerializedFile(t: EventTarget | null) {
    if (!t) return;
    const target = t as HTMLInputElement;

    const arrayBuffer = await target.files?.item(0)?.arrayBuffer();
    if (!arrayBuffer) return;

    const deserializedFarmer = deserialize(arrayBuffer);
    console.log(deserializedFarmer);
}

function getBlob(saveInfo: SaveInfo | undefined) {
    if (!saveInfo) return;

    const blobData = serialize(saveInfo);

    const blob = new Blob([blobData], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = saveInfo.name + `.stdew`;

    document.body.appendChild(a);

    // a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

buttonElement?.addEventListener("click", () => getBlob(XMLSaveInfo), false);
uploadSerializedFileInput?.addEventListener("change", async (event) => {
    await handleSerializedFile(event.target);
}, false);