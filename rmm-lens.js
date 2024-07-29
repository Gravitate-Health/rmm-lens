let pvData = pv;
let htmlData = html;

let epiData = epi;
let ipsData = ips;

let getSpecification = () => {
    return "1.0.0";
};

let enhance = async () => {
    // Proves that IPS exists
    let response;

    let listOfSM = await fetch("https://gravitate-health.lst.tfo.upm.es/epi/api/fhir/DocumentReference")

    for (let i = 0; i < listOfSM.length; i++) {
        let sm = listOfSM[i];

        if (sm.resource.subject.reference == epi.entry[0].resource.subject.reference) {
            if (epi.entry[0].resource.section[0].section[0].extension === undefined) {
                epi.entry[0].resource.section[0].section[0].extension = [];
            }

            let codeAndDisplay = getCodeAndDisplay(sm.resource.content.attachment);

            let newExtension;

            if (codeAndDisplay.code.incluides("inapp")) {
                newExtension = {
                    extension: [
                        {
                            url: "type",
                            valueCodeableConcept: {
                                coding: [
                                    {
                                        system: "http://hl7.eu/fhir/ig/gravitate-health/CodeSystem/type-of-data-cs",
                                        code: codeAndDisplay.code,
                                        display: codeAndDisplay.display
                                    }
                                ]

                            }
                        },
                        {
                            url: "concept",
                            valueBase64Binary: sm.resource.content[0].attachment.data
                        }
                    ],
                    url: "http://hl7.eu/fhir/ig/gravitate-health/StructureDefinition/AdditionalInformation"
                }
            } else {
                newExtension = {
                    extension: [
                        {
                            url: "type",
                            valueCodeableConcept: {
                                coding: [
                                    {
                                        system: "http://hl7.eu/fhir/ig/gravitate-health/CodeSystem/type-of-data-cs",
                                        code: codeAndDisplay.code,
                                        display: codeAndDisplay.display
                                    }
                                ]

                            }
                        },
                        {
                            url: sm.resource.content[0].attachment.url
                        }
                    ],
                    url: "http://hl7.eu/fhir/ig/gravitate-health/StructureDefinition/AdditionalInformation"
                }
            }

            epi.entry[0].resource.section[0].section[0].extension.push(newExtension);
        }
    }

    return response

};

getCodeAndDisplay = (data) => {
    if (data.contentType === "text/html") {
        if (data.duration) {
            if (data.url.contains("youtube")) {
                return {
                    code: "video-inapp",
                    display: "VIDEO"
                }
            } else {
                return {
                    code: "audio-inapp",
                    display: "AUDIO"
                }
            }

        } else {
            return {
                code: "image-inapp",
                display: "IMG"
            }
        }
    } else {
        switch (data.contentType) {
            case "video/mp4":
                return {
                    code: "video",
                    display: "VIDEO"
                }
            case "audio/mpeg":
                return {
                    code: "audio",
                    display: "AUDIO"
                }
            case "image/jpg":
                return {
                    code: "image",
                    display: "IMG"
                }
        }
    }
}


return {
    enhance: enhance,
    getSpecification: getSpecification,
};