require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({ 
    endpoint: process.env.COSMOS_ENDPOINT, 
    key: process.env.COSMOS_KEY 
});

async function check() {
    try {
        const { database } = await client.databases.createIfNotExists({ id: process.env.DATABASE_ID });
        const container = database.container('Cidadaos');
        const { resources } = await container.items.query({query: 'SELECT * FROM c WHERE c.tipoUtilizador = "Autarquia"'}).fetchAll();
        console.log('NUMERO_AUTARQUIAS=' + resources.length);
        resources.forEach(r => console.log('AUTARQUIA_ENCONTRADA=' + r.nome + ' (' + r.email + ')'));
    } catch(e) {
        console.log('Error:', e.message);
    }
}
check();
