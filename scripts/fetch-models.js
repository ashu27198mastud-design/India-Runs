const apiKey = 'AIzaSyANfxvFKLsWCdWLM8bpcSLN5srd4x6lW3Q';
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    const models = data.models.map(m => m.name);
    console.log(models);
  })
  .catch(err => console.error(err));
