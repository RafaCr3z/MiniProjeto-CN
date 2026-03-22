require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.DATABASE_ID;

const client = new CosmosClient({ endpoint, key });

async function getDatabase() {
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    return database;
}

async function getCidadaosContainer() {
    const db = await getDatabase();
    return db.container('Cidadaos');
}

async function getOcorrenciasContainer() {
    const db = await getDatabase();
    return db.container('Ocorrencias');
}

module.exports = { getCidadaosContainer, getOcorrenciasContainer };