const test = await fetch('https://dummyjson.com/products?limit=10&skip=0&select=title,price');
console.log(test);
const a = new Blob([test]);
console.log(a);

const fr = new FileReader();

fr.onload = function () {
  console.log(JSON.parse(this.result));
};

fr.readAsText(a);
