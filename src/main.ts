import { jsonToFarmer, parseXML } from "./parse";
import { deserialize, serialize } from "./serialize";
import type { Farmer } from "./types/base";

const inputElement = document.getElementById("saveFile") as HTMLInputElement;
const buttonElement = document.getElementById("saveFileSerialize");

inputElement?.addEventListener("change", (ev) => handleFiles(ev.target), false);
buttonElement?.setAttribute("disabled", "true");
const uploadSerializedFileInput = document.getElementById("uploadSerializedFile");

let XMLSaveData: Farmer;

async function handleFiles(t: EventTarget | null) {
    if (!t) return;
    const target = t as HTMLInputElement;

    const XMLData = await target.files?.item(0)?.text();
    if (!XMLData) return;

    const parsed = parseXML(XMLData);
    XMLSaveData = jsonToFarmer(parsed.Farmer);
    console.log(XMLSaveData);
    buttonElement?.removeAttribute("disabled");
}

async function handleSerializedFile(t: EventTarget | null) {
    if (!t) return;
    const target = t as HTMLInputElement;

    const arrayBuffer = await target.files?.item(0)?.arrayBuffer();
    if (!arrayBuffer) return;

    const deserializedFarmer = deserialize(arrayBuffer);
    console.log(deserializedFarmer);
}

function getBlob(farmer: Farmer) {
    const blobData = serialize(farmer);

    const blob = new Blob([blobData], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = farmer.name + `.stdew`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

buttonElement?.addEventListener("click", () => getBlob(XMLSaveData), false);
uploadSerializedFileInput?.addEventListener("change", async (event) => {
    await handleSerializedFile(event.target);
}, false);