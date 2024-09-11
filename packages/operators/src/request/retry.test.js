describe('User', function () {
  it('should save without error', async function () {
    console.log('YEAH');
    //expect(true).to.be.true;

    const req = new URL('https://dummyjson.com/products');
    req.searchParams.append('limit', 10);
    req.searchParams.append('skip', 5);
    req.searchParams.append('select', 'key1,key2,key3');
    const resp = await fetch(req);
    console.log(await resp.json());
  });
});
