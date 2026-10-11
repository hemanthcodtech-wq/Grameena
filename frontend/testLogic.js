const prodRes = {
  data: [
    { name: 'Groundnut Oil', category: 'Cold Press Oils', is_active: true, category_id: null },
    { name: 'Mango Pickle', category: 'Pickles', is_active: true, category_id: null },
    { name: 'Andhra Chekkalu', category: 'Traditional Snacks', is_active: true, category_id: null }
  ]
};

const catRes = {
  data: [
    { id: 4, name: 'Pickles' },
    { id: 5, name: 'Cold Press Oils' },
    { id: 6, name: 'Traditional Snacks' }
  ]
};

function testCategory(categoryName) {
  const searchParam = categoryName.toLowerCase().replace(/-/g, ' ');

  const cat = catRes.data.find(c => c.name.toLowerCase() === searchParam || c.name.toLowerCase().includes(searchParam));
  console.log(`For ${categoryName}, cat found:`, cat ? cat.name : 'null');

  const filtered = prodRes.data.filter(p => {
    if (!p.is_active) return false;
    if (cat && p.category_id === cat.id) return true;
    const dbCategory = (p.category || '').toLowerCase();
    return dbCategory.includes(searchParam) || searchParam.includes(dbCategory);
  });
  
  console.log(`Filtered products for ${categoryName}:`, filtered.map(p => p.name));
}

testCategory('oils');
testCategory('snacks');
testCategory('pickles');
