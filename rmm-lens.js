let pvData = pv;
let htmlData = html;

let epiData = epi;
let ipsData = ips;

let getSpecification = () => {
    return "1.0.0";
};

let enhance = async () => {

    console.log("__________ RMM LENS EXECUTION STARTED _____________")
    // Proves that IPS exists

    let medicinalProductDefinitionId = getMedicinalProductDefinitionId(epi);

    let listOfSMResponse = await fetch("https://gravitate-health.lst.tfo.upm.es/epi/api/fhir/DocumentReference?subject=" + medicinalProductDefinitionId);
    let listOfSM = await listOfSMResponse.json();

    let epiReference = epi.entry[0].resource.subject[0].reference;

    for (let i = 0; i < listOfSM.entry.length; i++) {
        let sm = listOfSM.entry[i];
        let smReference = sm.resource.subject.reference;
        
        if (smReference == epiReference) {
            console.log("SM Reference: ", smReference, " matched with EPI Reference: ", epiReference);
            
            // Create the extension at the beggining. TODO see where it should be
            if (epi.entry[0].resource.section[0].section[0].extension === undefined) {
                epi.entry[0].resource.section[0].section[0].extension = [];
            }

            let smAttachment = sm.resource.content[0].attachment

            let codeAndDisplay = getCodeAndDisplay(smAttachment);
            console.log("GetCodeAndDisplay: ", codeAndDisplay)
            if (codeAndDisplay === undefined) {
                continue;
            }

            let newExtension;

            //if (codeAndDisplay.code.includes("inapp")) {
            if (smAttachment.data !== undefined) {
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
                            valueBase64Binary: smAttachment.data
                        }
                    ],
                    url: "http://hl7.eu/fhir/ig/gravitate-health/StructureDefinition/AdditionalInformation"
                }
            //} else {
            } else if (smAttachment.url !== undefined) {
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
                            valueUrl: smAttachment.url
                        }
                    ],
                    url: "http://hl7.eu/fhir/ig/gravitate-health/StructureDefinition/AdditionalInformation"
                }
            }

            console.log("NEW EXTENSION: ", newExtension)

            // Check if extension already exists before adding it
            let currentExtensions = epi.entry[0].resource.section[0].section[0].extension || [];
            if (currentExtensions.length > 0) {
                let extensionExists = false;
                for (let j = 0; j < currentExtensions.length; j++) {
                    if (deepEqual(currentExtensions[j], newExtension)) {
                        extensionExists = true;
                        break;
                    }
                }
                if (!extensionExists) epi.entry[0].resource.section[0].section[0].extension.push(newExtension);
            } else {
                epi.entry[0].resource.section[0].section[0].extension.push(newExtension);
            }
            //epi.entry[0].resource.section[0].section[0].extension.push(newExtension);

        }
    }

    console.log("__________ RMM LENS EXECUTION FINISHED _____________")
    return htmlData;

};

getMedicinalProductDefinitionId = (bundle) => {
    for (let i = 0; i < bundle.entry.length; i++) {
        if (bundle.entry[i].resource.resourceType === "MedicinalProductDefinition") {
            return bundle.entry[i].resource.id;
        }
    }
    return null;
}

getCodeAndDisplay = (attachment) => {
    console.log("Function getCodeAndDisplay")
    console.log("Attachment: ", attachment)
    if (attachment.contentType === "text/html") {
        if (attachment.duration) {
            if (attachment.url.includes("youtube")) {
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
        switch (attachment.contentType) {
            case "video/mp4":
                return {
                    code: "video",
                    display: "VIDEO"
                }
            case "application/pdf":
                return {
                    code: "pdf",
                    display: "PDF"
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
            case "image/jpeg":
                return {
                    code: "image",
                    display: "IMG"
                }
        }
    }
}

function deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = isObject(val1) && isObject(val2);
      if (
        areObjects && !deepEqual(val1, val2) ||
        !areObjects && val1 !== val2
      ) {
        return false;
      }
    }
  
    return true;
  }
  
  function isObject(object) {
    return object != null && typeof object === 'object';
  }

return {
    enhance: enhance,
    getSpecification: getSpecification,
};