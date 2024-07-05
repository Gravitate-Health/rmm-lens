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

        let newDiv = document.createElement("div");
        newDiv.innerText = "Additional Supporting Material";

        let listOfSM = await fetch("https://gravitate-health.lst.tfo.upm.es/epi/api/fhir/DocumentReference")

        for (let i = 0; i < listOfSM.length; i++) {
            let sm = listOfSM[i];
            
            if (sm.resource.subject.reference == epi.entry[0].resource.subject.reference) {
                let newA = document.createElement("a");
                newA.href = sm.resource.content[0].attachment.url;
                newA.textContent = sm.resource.content[0].attachment.title;
                newA.type = sm.resource.content[0].attachment.contentType;
                newDiv.appendChild(newA);
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