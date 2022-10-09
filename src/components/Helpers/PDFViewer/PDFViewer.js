import React, { useRef, useEffect } from 'react';
import * as url from '../../Util/constants';

const PDFViewer = (props) => {
    let html = '<html><head><title>Print</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">';
    html += props.html;
    const myForm = useRef(null);

    useEffect(() => {
        myForm.current.submit();
    }, []);

    return (
        <form ref={myForm} method="POST" action={`${url.REQ_URL}/helper/generatePDF`}>
            <input type="hidden" name="html" value={html} />
        </form>
    );
}

export default PDFViewer;