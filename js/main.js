/**
 * Script principal para o Gerador de Histórias com IA
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicialização dos serviços
    const titleService = new TitleGeneratorService();
    const storyService = new StoryGeneratorService();
    const imageDescriptionService = new ImageDescriptionGeneratorService();
    
    // Elementos do DOM - Geração de Títulos
    const promptInput = document.getElementById('prompt-input');
    const generateTitlesBtn = document.getElementById('generate-titles-btn');
    const loadingTitles = document.getElementById('loading-titles');
    const titlesContainer = document.getElementById('titles-container');
    const titlesList = document.getElementById('titles-list');
    
    // Elementos do DOM - Geração de História
    const storyGeneratorCard = document.getElementById('story-generator-card');
    const selectedTitleElement = document.getElementById('selected-title');
    const generatePart1Btn = document.getElementById('generate-part1-btn');
    const generatePart2Btn = document.getElementById('generate-part2-btn');
    const generatePart3Btn = document.getElementById('generate-part3-btn');
    const generatePart4Btn = document.getElementById('generate-part4-btn');
    const loadingStory = document.getElementById('loading-story');
    const part1Container = document.getElementById('part1-container');
    const part2Container = document.getElementById('part2-container');
    const part3Container = document.getElementById('part3-container');
    const part4Container = document.getElementById('part4-container');
    const part1Content = document.getElementById('part1-content');
    const part2Content = document.getElementById('part2-content');
    const part3Content = document.getElementById('part3-content');
    const part4Content = document.getElementById('part4-content');
    
    // Elementos do DOM - Geração de Imagens
    const imageGeneratorCard = document.getElementById('image-generator-card');
    const generateImagePromptsBtn = document.getElementById('generate-image-prompts-btn');
    const loadingImagePrompts = document.getElementById('loading-image-prompts');
    const imagePromptsContainer = document.getElementById('image-prompts-container');
    const imagePromptsList = document.getElementById('image-prompts-list');
    const generateImagesBtn = document.getElementById('generate-images-btn');
    const loadingImages = document.getElementById('loading-images');
    const imagesContainer = document.getElementById('images-container');
    
    // Estado da aplicação
    const state = {
        selectedTitle: '',
        storyParts: {
            part1: '',
            part2: '',
            part3: '',
            part4: ''
        },
        imageDescriptions: [],
        generatedImages: []
    };
    
    // ----------------------------------------
    // Eventos - Geração de Títulos
    // ----------------------------------------
    
    generateTitlesBtn.addEventListener('click', async () => {
        try {
            // Mostrar loading
            generateTitlesBtn.disabled = true;
            loadingTitles.classList.remove('d-none');
            titlesContainer.classList.add('d-none');
            
            // Gerar títulos
            const additionalPrompt = promptInput.value.trim();
            const titles = await titleService.generateTitles(additionalPrompt);
            
            // Mostrar títulos
            titlesList.innerHTML = '';
            titles.forEach((title, index) => {
                const item = document.createElement('button');
                item.className = 'list-group-item list-group-item-action';
                item.textContent = title;
                item.addEventListener('click', () => selectTitle(title));
                titlesList.appendChild(item);
            });
            
            // Esconder loading e mostrar títulos
            loadingTitles.classList.add('d-none');
            titlesContainer.classList.remove('d-none');
        } catch (error) {
            alert(`Erro ao gerar títulos: ${error.message}`);
            console.error('Erro ao gerar títulos:', error);
        } finally {
            generateTitlesBtn.disabled = false;
        }
    });
    
    // Função para selecionar um título
    function selectTitle(title) {
        // Atualizar estado
        state.selectedTitle = title;
        
        // Atualizar UI
        titlesList.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === title) {
                btn.classList.add('active');
            }
        });
        
        selectedTitleElement.textContent = title;
        storyGeneratorCard.classList.remove('d-none');
        
        // Resetar partes da história
        resetStoryParts();
    }
    
    // Função para resetar as partes da história
    function resetStoryParts() {
        state.storyParts = {
            part1: '',
            part2: '',
            part3: '',
            part4: ''
        };
        
        part1Container.classList.add('d-none');
        part2Container.classList.add('d-none');
        part3Container.classList.add('d-none');
        part4Container.classList.add('d-none');
        
        part1Content.textContent = '';
        part2Content.textContent = '';
        part3Content.textContent = '';
        part4Content.textContent = '';
        
        generatePart2Btn.classList.add('d-none');
        generatePart3Btn.classList.add('d-none');
        generatePart4Btn.classList.add('d-none');
        
        // Resetar também a geração de imagens
        resetImageGeneration();
    }
    
    // ----------------------------------------
    // Eventos - Geração de História
    // ----------------------------------------
    
    generatePart1Btn.addEventListener('click', async () => {
        await generateStoryPart(1);
    });
    
    generatePart2Btn.addEventListener('click', async () => {
        await generateStoryPart(2);
    });
    
    generatePart3Btn.addEventListener('click', async () => {
        await generateStoryPart(3);
    });
    
    generatePart4Btn.addEventListener('click', async () => {
        await generateStoryPart(4);
    });
    
    // Função para gerar uma parte da história
    async function generateStoryPart(partNumber) {
        try {
            // Mostrar loading
            disableAllStoryButtons(true);
            loadingStory.classList.remove('d-none');
            
            // Preparar contexto de partes anteriores
            let previousParts = '';
            if (partNumber > 1) {
                for (let i = 1; i < partNumber; i++) {
                    previousParts += state.storyParts[`part${i}`] + '\n\n';
                }
            }
            
            // Gerar parte da história
            const storyPart = await storyService.generateStoryPart(
                state.selectedTitle,
                partNumber,
                previousParts
            );
            
            // Atualizar estado
            state.storyParts[`part${partNumber}`] = storyPart;
            
            // Atualizar UI
            const partContainer = document.getElementById(`part${partNumber}-container`);
            const partContent = document.getElementById(`part${partNumber}-content`);
            
            partContent.textContent = storyPart;
            partContainer.classList.remove('d-none');
            
            // Habilitar o próximo botão, se houver
            if (partNumber < 4) {
                const nextPartBtn = document.getElementById(`generate-part${partNumber + 1}-btn`);
                nextPartBtn.classList.remove('d-none');
            } else {
                // Se for a última parte, mostrar o gerador de imagens
                imageGeneratorCard.classList.remove('d-none');
            }
            
            // Esconder loading
            loadingStory.classList.add('d-none');
            
            // Rolar para a parte gerada
            partContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            alert(`Erro ao gerar parte ${partNumber} da história: ${error.message}`);
            console.error(`Erro ao gerar parte ${partNumber} da história:`, error);
        } finally {
            disableAllStoryButtons(false);
        }
    }
    
    // Função para desabilitar todos os botões de geração de história
    function disableAllStoryButtons(disabled) {
        generatePart1Btn.disabled = disabled;
        generatePart2Btn.disabled = disabled;
        generatePart3Btn.disabled = disabled;
        generatePart4Btn.disabled = disabled;
    }
    
    // ----------------------------------------
    // Eventos - Geração de Imagens
    // ----------------------------------------
    
    generateImagePromptsBtn.addEventListener('click', async () => {
        try {
            // Verificar se todas as partes da história foram geradas
            if (!state.storyParts.part1 || !state.storyParts.part2 || 
                !state.storyParts.part3 || !state.storyParts.part4) {
                alert('Você precisa gerar todas as partes da história antes de gerar descrições de imagens.');
                return;
            }
            
            // Mostrar loading
            generateImagePromptsBtn.disabled = true;
            loadingImagePrompts.classList.remove('d-none');
            imagePromptsContainer.classList.add('d-none');
            
            // Combinar todas as partes da história
            const fullStory = [
                state.storyParts.part1,
                state.storyParts.part2,
                state.storyParts.part3,
                state.storyParts.part4
            ].join('\n\n');
            
            // Gerar descrições de imagens
            const descriptions = await imageDescriptionService.generateImageDescriptions(
                state.selectedTitle,
                fullStory
            );
            
            // Atualizar estado
            state.imageDescriptions = descriptions;
            
            // Mostrar descrições
            imagePromptsList.innerHTML = '';
            descriptions.forEach((description, index) => {
                // Extrair título da descrição (primeira linha)
                const titleMatch = description.match(/Descrição #\d+: \[(.*?)\]/);
                const descTitle = titleMatch ? titleMatch[1] : `Imagem ${index + 1}`;
                
                // Criar item do acordeão
                const accordionItem = document.createElement('div');
                accordionItem.className = 'accordion-item';
                accordionItem.innerHTML = `
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                            ${descTitle}
                        </button>
                    </h2>
                    <div id="collapse${index}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <div class="image-prompt-text">${description}</div>
                            <div class="image-result mt-3 d-none">
                                <img src="" alt="${descTitle}" class="img-fluid rounded">
                            </div>
                        </div>
                    </div>
                `;
                
                imagePromptsList.appendChild(accordionItem);
            });
            
            // Esconder loading e mostrar descrições
            loadingImagePrompts.classList.add('d-none');
            imagePromptsContainer.classList.remove('d-none');
        } catch (error) {
            alert(`Erro ao gerar descrições de imagens: ${error.message}`);
            console.error('Erro ao gerar descrições de imagens:', error);
        } finally {
            generateImagePromptsBtn.disabled = false;
        }
    });
   // Substitua a função generateImagePromptsBtn.addEventListener no arquivo js/main.js

generateImagePromptsBtn.addEventListener('click', async () => {
    try {
        // Verificar se todas as partes da história foram geradas
        if (!state.storyParts.part1 || !state.storyParts.part2) {
            alert('Você precisa gerar pelo menos as partes 1 e 2 da história antes de gerar descrições de imagens.');
            return;
        }
        
        // Mostrar loading
        generateImagePromptsBtn.disabled = true;
        loadingImagePrompts.classList.remove('d-none');
        imagePromptsContainer.classList.add('d-none');
        
        // Combinar as partes da história disponíveis
        const availableParts = [];
        if (state.storyParts.part1) availableParts.push(state.storyParts.part1);
        if (state.storyParts.part2) availableParts.push(state.storyParts.part2);
        if (state.storyParts.part3) availableParts.push(state.storyParts.part3);
        if (state.storyParts.part4) availableParts.push(state.storyParts.part4);
        
        const fullStory = availableParts.join('\n\n');
        
        // Gerar descrições de imagens
        try {
            const descriptions = await imageDescriptionService.generateImageDescriptions(
                state.selectedTitle,
                fullStory
            );
            
            // Atualizar estado
            state.imageDescriptions = descriptions;
            
            // Mostrar descrições
            imagePromptsList.innerHTML = '';
            descriptions.forEach((description, index) => {
                // Extrair título da descrição (primeira linha)
                const titleMatch = description.match(/Descrição #\d+: \[(.*?)\]/);
                const descTitle = titleMatch ? titleMatch[1] : `Imagem ${index + 1}`;
                
                // Criar item do acordeão
                const accordionItem = document.createElement('div');
                accordionItem.className = 'accordion-item';
                accordionItem.innerHTML = `
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                            ${descTitle}
                        </button>
                    </h2>
                    <div id="collapse${index}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <div class="image-prompt-text">${description}</div>
                            <div class="image-result mt-3 d-none">
                                <img src="" alt="${descTitle}" class="img-fluid rounded">
                            </div>
                        </div>
                    </div>
                `;
                
                imagePromptsList.appendChild(accordionItem);
            });
            
            // Esconder loading e mostrar descrições
            loadingImagePrompts.classList.add('d-none');
            imagePromptsContainer.classList.remove('d-none');
        } catch (error) {
            alert(`Erro ao gerar descrições de imagens: ${error.message}\n\nTente novamente.`);
            console.error('Erro ao gerar descrições de imagens:', error);
            
            // Mesmo com erro, desbloquear a interface
            loadingImagePrompts.classList.add('d-none');
        }
    } catch (error) {
        alert(`Erro ao gerar descrições de imagens: ${error.message}`);
        console.error('Erro ao gerar descrições de imagens:', error);
    } finally {
        generateImagePromptsBtn.disabled = false;
    }
});

// Substitua a função generateImagesBtn.addEventListener no arquivo js/main.js

generateImagesBtn.addEventListener('click', async () => {
    try {
        // Verificar se há descrições de imagens
        if (state.imageDescriptions.length === 0) {
            alert('Você precisa gerar descrições de imagens antes.');
            return;
        }
        
        // Mostrar loading
        generateImagesBtn.disabled = true;
        loadingImages.classList.remove('d-none');
        
        // Limpar imagens anteriores
        imagesContainer.innerHTML = '';
        state.generatedImages = [];
        
        // Gerar imagens uma a uma (para não sobrecarregar a API)
        // Vamos gerar apenas as primeiras 4 imagens para demonstração
        const maxImagesToGenerate = Math.min(4, state.imageDescriptions.length);
        
        for (let i = 0; i < maxImagesToGenerate; i++) {
            try {
                // Atualizar mensagem de loading
                const loadingMessage = loadingImages.querySelector('p');
                loadingMessage.textContent = `Gerando imagem ${i + 1} de ${maxImagesToGenerate}, por favor aguarde...`;
                
                // Gerar imagem
                try {
                    const imageUrl = await imageDescriptionService.generateImage(state.imageDescriptions[i]);
                    
                    if (imageUrl) {
                        // Atualizar estado
                        state.generatedImages.push({
                            description: state.imageDescriptions[i],
                            url: imageUrl
                        });
                        
                        // Mostrar imagem na descrição correspondente
                        const imageResult = document.querySelector(`#collapse${i} .image-result`);
                        if (imageResult) {
                            const imageElement = imageResult.querySelector('img');
                            imageElement.src = imageUrl;
                            imageResult.classList.remove('d-none');
                        }
                        
                        // Adicionar à galeria
                        addImageToGallery(state.imageDescriptions[i], imageUrl, i);
                    } else {
                        console.error(`Não foi possível gerar a imagem ${i + 1}: URL inválida`);
                    }
                } catch (imageError) {
                    console.error(`Erro ao gerar imagem ${i + 1}:`, imageError);
                    // Continuar para a próxima imagem mesmo com erro
                }
                
                // Pequena pausa entre requisições para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Erro ao gerar imagem ${i + 1}:`, error);
                // Continua para a próxima imagem mesmo se houver erro
            }
        }
        
        // Esconder loading e mostrar imagens
        loadingImages.classList.add('d-none');
        if (state.generatedImages.length > 0) {
            imagesContainer.classList.remove('d-none');
        } else {
            alert('Não foi possível gerar nenhuma imagem. Por favor, tente novamente.');
        }
    } catch (error) {
        alert(`Erro ao gerar imagens: ${error.message}`);
        console.error('Erro ao gerar imagens:', error);
    } finally {
        generateImagesBtn.disabled = false;
    }
});
    // Função para adicionar uma imagem à galeria
    function addImageToGallery(description, imageUrl, index) {
        // Extrair título da descrição (primeira linha)
        const titleMatch = description.match(/Descrição #\d+: \[(.*?)\]/);
        const title = titleMatch ? titleMatch[1] : `Imagem ${index + 1}`;
        
        // Criar card de imagem
        const imageCol = document.createElement('div');
        imageCol.className = 'col-md-6 col-lg-3';
        imageCol.innerHTML = `
            <div class="card image-card">
                <img src="${imageUrl}" class="card-img-top" alt="${title}">
                <div class="card-body">
                    <h5 class="card-title h6">${title}</h5>
                    <a href="${imageUrl}" class="btn btn-sm btn-primary" target="_blank">Ver em tamanho real</a>
                </div>
            </div>
        `;
        
        imagesContainer.appendChild(imageCol);
    }
    
    // Função para resetar a geração de imagens
    function resetImageGeneration() {
        state.imageDescriptions = [];
        state.generatedImages = [];
        
        imageGeneratorCard.classList.add('d-none');
        imagePromptsContainer.classList.add('d-none');
        imagesContainer.classList.add('d-none');
        
        imagePromptsList.innerHTML = '';
        imagesContainer.innerHTML = '';
    }
}); 