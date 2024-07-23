let pvData = pv;
let htmlData = html;

let epiData = epi;
let ipsData = ips;

let getSpecification = () => {
    return "1.0.0";
};

let enhance = async () => {
    // Proves that IPS exists
    if (htmlData == epi.entry[0].resource.section[0].section[0].text.div) {
        let document;
        let response;
    
        if (typeof window === "undefined") {
            let jsdom = await import("jsdom");
            let { JSDOM } = jsdom;
            let dom = new JSDOM(htmlData);
            document = dom.window.document;
        } else {
            document = window.document;
        }

        let listOfSM = await fetch("https://gravitate-health.lst.tfo.upm.es/epi/api/fhir/DocumentReference")

        for (let i = 0; i < listOfSM.length; i++) {
            let sm = listOfSM[i];
            
            if (sm.resource.subject.reference == epi.entry[0].resource.subject.reference) {
                if(epi.entry[0].resource.section[0].section[0].extension === undefined) {
                    epi.entry[0].resource.section[0].section[0].extension = [];
                }

                let newExtension = {
                    extension: [
                        {
                            url: "type",
                            valueCodeableConcept: {
                                coding: [
                                    {
                                        system: "http://terminology.hl7.org/CodeSystem/v3-DocumentSectionType",
                                        code: "SM",
                                        display: "Summary of Medication"
                                    }
                                ]
                            
                            }
                        },
                        {
                            url: "concept",
                            valueBase64Binary: sm.resource.content.attachment.data
                        }
                    ],
                    url: "http://hl7.eu/fhir/ig/gravitate-health/StructureDefinition/AdditionalInformation"
                }

                epi.entry[0].resource.section[0].section[0].extension.push(newExtension);
            }
        }

        document.body.getElementsByTagName("div")[0].appendChild(newDiv);

        if (document.getElementsByTagName("head").length > 0) {
            document.getElementsByTagName("head")[0].remove();
        }
        if (document.getElementsByTagName("body").length > 0) {
            response = document.getElementsByTagName("body")[0].innerHTML;
        }

        return response
    }

    return htmlData;
};

return {
    enhance: enhance,
    getSpecification: getSpecification,
};