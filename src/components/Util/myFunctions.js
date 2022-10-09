const _MS_PER_DAY = 1000 * 60 * 60 * 24;

export const formatDate = (date) => {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
  
    return month + '/' + day + '/' + year;
};

// a and b are javascript Date objects
export const dateDiffInDays = (a, b) => {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export const getFormattedNum = (num) => {
  if(isNaN(num)){
    return parseFloat(num.substring(1, num.length).replace(/,/g, '')).toFixed(2);
  }
  return parseFloat(num.toString().replace(/,/g, '')).toFixed(2);
}

export function printReports(divId){
  var content = document.getElementById(divId).innerHTML;
  var mywindow = window.open('', 'Print', 'height=600,width=800');

  mywindow.document.write('<html><head><title>Print</title>');
  mywindow.document.write('<meta charset="utf-8">');
  mywindow.document.write('<meta name="viewport" content="width=device-width, initial-scale=1">');
  mywindow.document.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">');
  mywindow.document.write('</head><body >');
  mywindow.document.write(content);
  mywindow.document.write('</body></html>');
  mywindow.document.close();
  mywindow.focus()
  mywindow.print();
  return true;
}