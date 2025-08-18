document.getElementById('record-form').addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const price = document.getElementById('price').value;
  const grade = document.getElementById('grade').value;
  const image = document.getElementById('image').value;

  const res = await fetch('data/records.json');
  const records = await res.json();
  records.push({ title, price, grade, image });

  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'records.json';
  a.click();
});
