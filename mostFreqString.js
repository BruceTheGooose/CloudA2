//https://appendto.com/2016/10/finding-the-most-frequent-string-in-a-javascript-array/
function mostFreqStr(arr) {
  var obj = {}, mostFreq = 0, which = [];

  arr.forEach(ea => {
    if (!obj[ea]) {
      obj[ea] = 1;
    } else {
      obj[ea]++;
    }

    if (obj[ea] > mostFreq) {
      mostFreq = obj[ea];
      which = [ea];
    } else if (obj[ea] === mostFreq) {
      which.push(ea);
    }
  });

  if (which.length > 1) {
    which = `"${which.join(`" and "`)}" are the most frequent strings in the array.`
  } else {
    which = `"${which}" is the most frequent string in the array.`
  }

  return which;
}

document.body.innerHTML += (mostFreqStr(["x", "x", "y", "y", "y", "z"])) + `<br/>`; //"y" is the most frequent string in the array.
document.body.innerHTML += (mostFreqStr(["x", "x", "x", "y", "y", "y", "z"])) + `<br/>`; //"x" and "y" are the most frequent strings in the array.
