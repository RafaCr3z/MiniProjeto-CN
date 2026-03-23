const express = require('express');
const { getCidadaosContainer, getOcorrenciasContainer } = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Rota de teste
app.get('/api/teste-bd', async (req, res) => {
    try {
        const container = await getCidadaosContainer();
        res.status(200).json({ 
            mensagem: "Sucesso! A API CityGuards está ligada ao Azure Cosmos DB.",
            containerId: container.id
        });
    } catch (error) {
        res.status(500).json({ erro: "Falha na ligação à base de dados." });
    }
});

// NOVA ROTA: Criar um novo Cidadão
app.post('/api/cidadaos', async (req, res) => {
    try {
        const { nome, email } = req.body; // Recebe os dados enviados pelo frontend

        // Validação simples
        if (!nome || !email) {
            return res.status(400).json({ erro: "O nome e o email são obrigatórios!" });
        }

        const container = await getCidadaosContainer();

        // Estrutura do documento JSON do cidadão
        const novoCidadao = {
            id: Date.now().toString(), // Gera um ID único baseado no tempo atual
            nome: nome,
            email: email,
            pontosGamificacao: 0, // O utilizador começa com 0 pontos
            dataRegisto: new Date().toISOString(),
            tipoUtilizador: "Cidadao"
        };

        // Guarda na base de dados (Cosmos DB)
        const { resource } = await container.items.create(novoCidadao);
        
        res.status(201).json({ 
            mensagem: "Cidadão registado com sucesso!", 
            dados: resource 
        });

    } catch (error) {
        console.error("Erro ao criar cidadão:", error);
        res.status(500).json({ erro: "Falha ao registar o cidadão na base de dados." });
    }
});

// NOVA ROTA: Obter Cidadão por Email (Para Login)
app.get('/api/cidadaos/email/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const container = await getCidadaosContainer();
        
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };
        
        const { resources } = await container.items.query(querySpec).fetchAll();
        
        if (resources.length === 0) {
            return res.status(404).json({ erro: "Cidadão não encontrado." });
        }
        
        res.status(200).json({ dados: resources[0] });
    } catch (error) {
        console.error("Erro ao procurar cidadão:", error);
        res.status(500).json({ erro: "Falha na base de dados." });
    }
});

// NOVA ROTA: Ocorrências de um Cidadão (Para o Perfil Histórico)
app.get('/api/ocorrencias/cidadao/:id', async (req, res) => {
    try {
        const cidadaoId = req.params.id;
        const container = await getOcorrenciasContainer();
        
        const querySpec = {
            query: "SELECT * FROM c WHERE c.cidadaoId = @cidadaoId ORDER BY c.dataReporte DESC",
            parameters: [{ name: "@cidadaoId", value: cidadaoId }]
        };
        
        const { resources } = await container.items.query(querySpec).fetchAll();
        
        res.status(200).json({ dados: resources });
    } catch (error) {
        res.status(500).json({ erro: "Falha na base de dados." });
    }
});

// NOVA ROTA: Registar uma Ocorrência
app.post('/api/ocorrencias', async (req, res) => {
    try {
        // Recebe os dados enviados pela App do cidadão
        const { cidadaoId, descricao, latitude, longitude, fotografiaUrl } = req.body;

        // Validação básica para garantir que não faltam dados cruciais
        if (!cidadaoId || !descricao || !latitude || !longitude) {
            return res.status(400).json({ erro: "Faltam dados obrigatórios para registar a ocorrência." });
        }

        const container = await getOcorrenciasContainer();

        // Estrutura do documento JSON da ocorrência
        const novaOcorrencia = {
            id: `report_${Date.now()}`,
            cidadaoId: cidadaoId, // A Partition Key que definimos no Azure!
            descricao: descricao,
            categoria: "Por classificar", // O Tiago depois vai atualizar isto com a IA
            estado: "Pendente", // Todas as ocorrências começam como pendentes
            localizacao: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            fotografiaUrl: fotografiaUrl || "", // O link do Blob Storage que o Tiago vai fazer
            dataReporte: new Date().toISOString()
        };

        // Guarda na base de dados (Cosmos DB)
        const { resource } = await container.items.create(novaOcorrencia);
        
        res.status(201).json({ 
            mensagem: "Ocorrência registada com sucesso!", 
            dados: {
                id: resource.id,
                estado: resource.estado,
                data: resource.dataReporte
            }
        });

    } catch (error) {
        console.error("Erro ao criar ocorrência:", error);
        res.status(500).json({ erro: "Falha ao registar a ocorrência na base de dados." });
    }
});

// NOVA ROTA: Listar todas as Ocorrências (Para o Dashboard da Câmara)
app.get('/api/ocorrencias', async (req, res) => {
    try {
        const container = await getOcorrenciasContainer();

        // Query para buscar todas as ocorrências, ordenadas por data (mais recentes primeiro)
        const querySpec = {
            query: "SELECT * FROM c ORDER BY c.dataReporte DESC"
        };

        const { resources: ocorrencias } = await container.items.query(querySpec).fetchAll();

        res.status(200).json({
            mensagem: "Lista de ocorrências recuperada com sucesso!",
            total: ocorrencias.length,
            dados: ocorrencias
        });

    } catch (error) {
        console.error("Erro ao listar ocorrências:", error);
        res.status(500).json({ erro: "Falha ao buscar as ocorrências na base de dados." });
    }
});

// NOVA ROTA: Resolver ocorrência e atribuir pontos (Motor de Gamificação)
app.put('/api/ocorrencias/:id/resolver', async (req, res) => {
    try {
        const ocorrenciaId = req.params.id;
        const ocorrenciasContainer = await getOcorrenciasContainer();
        const cidadaosContainer = await getCidadaosContainer();

        // 1. Procurar a ocorrência na base de dados pelo ID
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: ocorrenciaId }]
        };
        const { resources } = await ocorrenciasContainer.items.query(querySpec).fetchAll();
        
        if (resources.length === 0) {
            return res.status(404).json({ erro: "Ocorrência não encontrada." });
        }

        const ocorrencia = resources[0];

        // 2. Verificar se já está resolvida (evita que a Câmara dê pontos a dobrar por engano)
        if (ocorrencia.estado === "Resolvido") {
            return res.status(400).json({ erro: "Esta ocorrência já foi resolvida. Os pontos já foram atribuídos!" });
        }

        // 3. Atualizar o estado da ocorrência para "Resolvido"
        ocorrencia.estado = "Resolvido";
        // No Cosmos DB, o 'replace' substitui o documento antigo pelo novo
        await ocorrenciasContainer.item(ocorrencia.id, ocorrencia.cidadaoId).replace(ocorrencia);

        // 4. Motor de Gamificação: Atribuir os pontos ao Cidadão
        const pontosAAtribuir = 50; // Vamos definir 50 pontos por cada alerta resolvido
        
        // Vai buscar o perfil do cidadão usando o cidadaoId que estava guardado na ocorrência
        const { resource: cidadao } = await cidadaosContainer.item(ocorrencia.cidadaoId, ocorrencia.cidadaoId).read();
        
        if (cidadao) {
            // Soma os pontos e atualiza o perfil do cidadão na base de dados
            cidadao.pontosGamificacao += pontosAAtribuir;
            await cidadaosContainer.item(cidadao.id, cidadao.id).replace(cidadao);
        }

        res.status(200).json({
            mensagem: "Ocorrência resolvida com sucesso! Pontos de gamificação atribuídos.",
            ocorrenciaId: ocorrencia.id,
            cidadaoRecompensado: cidadao.nome,
            novaPontuacao: cidadao.pontosGamificacao
        });

    } catch (error) {
        console.error("Erro no motor de gamificação:", error);
        res.status(500).json({ erro: "Falha ao resolver a ocorrência e atribuir pontos." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor CityGuards a correr na porta ${PORT}`);
});