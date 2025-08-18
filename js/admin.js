document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('record-form');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const grade = document.getElementById('grade').value;
    const image = document.getElementById('image').value || "1000042083.png";

    try {
      const res = await fetch('/data/records.json');
      let records = await res.json();

      records.push({ title, price, grade, image });

      const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'records.json';
      a.click();
      URL.revokeObjectURL(url);

      alert(`${title} added! Downloaded updated records.json. Upload it to GitHub to go live.`);
      form.reset();
    } catch (err) {
      console.error("Error updating records:", err);
      alert("Could not load records.json. Make sure it exists in /data/");
    }
  });
});
