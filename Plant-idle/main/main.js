// ===== JOGO =====
let dinheiro = 20
let minerios = 0
let picaretaNivel = 1
let mineiros = 0
let profundidade = 1
let mineriosPorClique = 1
// ===== AUTO-MINER =====
let autoMinerAtivo = false
let autoMinerDesbloqueado = false
let autoMinerPreco = 5000
let autoMinerInterval = null
// Dados da mina
const mina = []
const linhas = 8
const colunas = 8

// ===== SALVAR E CARREGAR =====
function salvarJogo() {
    const dados = {
        dinheiro: dinheiro,
        minerios: minerios,
        picaretaNivel: picaretaNivel,
        mineiros: mineiros,
        profundidade: profundidade,
        mineriosPorClique: mineriosPorClique,
        autoMinerDesbloqueado: autoMinerDesbloqueado,
        autoMinerAtivo: autoMinerAtivo,
        mina: mina.map(b => ({
            quebrado: b.quebrado,
            tipo: b.tipo,
            valor: b.valor
        })),
        bancoSaldo: bancoSaldo,
        bancoTotalAcumulado: bancoTotalAcumulado,
        bancoNivelJuros: bancoNivelJuros,
        bancoHistorico: bancoHistorico,
        marteloQtd: marteloQtd,
        dinamiteQtd: dinamiteQtd,
        minaSecretaDesbloqueada: minaSecretaDesbloqueada
    }
    localStorage.setItem('mineradorIdle', JSON.stringify(dados))
}
function carregarJogo() {
    const dadosSalvos = localStorage.getItem('mineradorIdle')
    if (dadosSalvos) {
        try {
            const dados = JSON.parse(dadosSalvos)
            dinheiro = dados.dinheiro || 20
            minerios = dados.minerios || 0
            picaretaNivel = dados.picaretaNivel || 1
            mineiros = dados.mineiros || 0
            profundidade = dados.profundidade || 1
            mineriosPorClique = dados.mineriosPorClique || 1
            autoMinerDesbloqueado = dados.autoMinerDesbloqueado || false
            autoMinerAtivo = dados.autoMinerAtivo || false
            bancoSaldo = dados.bancoSaldo || 0
            bancoTotalAcumulado = dados.bancoTotalAcumulado || 0
            bancoNivelJuros = dados.bancoNivelJuros || 1
            bancoHistorico = dados.bancoHistorico || []
            marteloQtd = dados.marteloQtd || 0
            dinamiteQtd = dados.dinamiteQtd || 0
            minaSecretaDesbloqueada = dados.minaSecretaDesbloqueada || false
            
            // Se estava ativo, reativa o intervalo
            if (autoMinerAtivo && autoMinerDesbloqueado) {
                autoMinerInterval = setInterval(() => {
                    const disponiveis = mina.map((b, i) => b.quebrado ? -1 : i).filter(i => i >= 0)
                    if (disponiveis.length === 0) {
                        resetarMina()
                        return
                    }
                    const index = disponiveis[Math.floor(Math.random() * disponiveis.length)]
                    const ganho = mina[index].valor * mineriosPorClique
                    minerios += ganho
                    criarAnimacao(index)
                    atualizarUI()
                    salvarJogo()
                }, 1000)
            }
            
            if (dados.mina) {
                for (let i = 0; i < mina.length && i < dados.mina.length; i++) {
                    mina[i].quebrado = dados.mina[i].quebrado
                    mina[i].tipo = dados.mina[i].tipo
                    mina[i].valor = dados.mina[i].valor
                }
            }
            return true
        } catch (e) {
            console.log('Erro ao carregar save, usando valores padrão')
            return false
        }
    }
    return false
}

function resetarJogo() {
    if (confirm('Tem certeza? Isso vai resetar TODO o seu progresso!')) {
        localStorage.removeItem('mineradorIdle')
        location.reload()
    }
}

// ===== CANVAS =====
const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

function resizeCanvas() {
    const container = canvas.parentElement
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)
// ===== MINÉRIOS =====
const tiposMinerio = [{
    nome: 'Pedra',
    cor: '#4a6a4a',
    corEscura: '#3a5a3a',
    valor: 1,
    brilho: '#6a8a4a'
}, {
    nome: 'Ferro',
    cor: '#6a7a6a',
    corEscura: '#5a6a5a',
    valor: 2,
    brilho: '#8a9a8a'
}, {
    nome: 'Cobre',
    cor: '#8a6a4a',
    corEscura: '#7a5a3a',
    valor: 3,
    brilho: '#aa8a6a'
}, {
    nome: 'Prata',
    cor: '#8a8a9a',
    corEscura: '#7a7a8a',
    valor: 5,
    brilho: '#aaaaba'
}, {
    nome: 'Ouro',
    cor: '#d4a830',
    corEscura: '#b89220',
    valor: 8,
    brilho: '#f4c850'
}, {
    nome: 'Diamante',
    cor: '#4ac0d4',
    corEscura: '#3aa0b4',
    valor: 12,
    brilho: '#6ae0f4'
}, {
    nome: 'Rubi',
    cor: '#d43a3a',
    corEscura: '#b42a2a',
    valor: 18,
    brilho: '#f45a5a'
}, {
    nome: 'Esmeralda',
    cor: '#3ad48a',
    corEscura: '#2ab47a',
    valor: 25,
    brilho: '#5af4aa'
}, {
    nome: 'Cristal Mágico',
    cor: '#aa4ad4',
    corEscura: '#8a3ab4',
    valor: 35,
    brilho: '#ca6af4'
}, {
    nome: 'Estrelar',
    cor: '#f4d44a',
    corEscura: '#d4b82a',
    valor: 50,
    brilho: '#fae86a'
}]
// ===== INICIALIZAR MINA =====
function inicializarMina() {
    mina.length = 0
    for (let i = 0; i < linhas * colunas; i++) {
        const tipoMaximo = Math.min(profundidade, tiposMinerio.length) - 1
        const tipo = Math.floor(Math.random() * (tipoMaximo + 1))
        mina.push({
            quebrado: false,
            tipo: tipo,
            valor: tiposMinerio[tipo].valor
        })
    }
}
// ===== RESETAR MINA =====
function resetarMina() {
    for (let i = 0; i < mina.length; i++) {
        if (mina[i].quebrado) {
            const tipoMaximo = Math.min(profundidade, tiposMinerio.length) - 1
            const tipo = Math.floor(Math.random() * (tipoMaximo + 1))
            mina[i].tipo = tipo
            mina[i].valor = tiposMinerio[tipo].valor
            mina[i].quebrado = false
        }
    }
}
inicializarMina()
// ===== PEGAR POSIÇÃO DO MOUSE =====
canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    minerar(x, y)
})
// ===== ANIMAÇÕES =====
let animacoes = []

function criarAnimacao(index) {
    const row = Math.floor(index / colunas)
    const col = index % colunas
    const cellSize = Math.min(
        (canvas.width - 40) / colunas, (canvas.height - 40) / linhas)
    const offsetX = (canvas.width - cellSize * colunas) / 2
    const offsetY = (canvas.height - cellSize * linhas) / 2
    animacoes.push({
        index: index,
        x: offsetX + col * cellSize,
        y: offsetY + row * cellSize,
        tamanho: cellSize,
        progresso: 0,
        duracao: 30, // frames
        shakeX: 0,
        shakeY: 0
    })
}

function atualizarAnimacoes() {
    for (let i = animacoes.length - 1; i >= 0; i--) {
        const anim = animacoes[i]
        anim.progresso++
            // Shake (oscilação)
            const intensidade = 4 * (1 - anim.progresso / anim.duracao)
        anim.shakeX = (Math.random() - 0.5) * intensidade
        anim.shakeY = (Math.random() - 0.5) * intensidade
        // Quando termina, remove a animação e quebra o bloco
        if (anim.progresso >= anim.duracao) {
            mina[anim.index].quebrado = true
            animacoes.splice(i, 1)
        }
    }
}

function desenharAnimacoes() {
    for (const anim of animacoes) {
        const x = anim.x + anim.shakeX
        const y = anim.y + anim.shakeY
        const size = anim.tamanho
        // Sombra de quebra
        ctx.fillStyle = 'rgba(255, 200, 100, 0.2)'
        ctx.fillRect(x, y, size, size)
        // Partículas (estilhaços voando)
        const progresso = anim.progresso / anim.duracao
        const numParticulas = 6
        for (let i = 0; i < numParticulas; i++) {
            const angulo = (i / numParticulas) * Math.PI * 2 + progresso * 0.5
            const distancia = progresso * size * 0.4
            const px = x + size / 2 + Math.cos(angulo) * distancia
            const py = y + size / 2 + Math.sin(angulo) * distancia
            const tamanhoParticula = 2 + (1 - progresso) * 4
            ctx.fillStyle = `rgba(255, 200, 100, ${1 - progresso})`
            ctx.beginPath()
            ctx.arc(px, py, tamanhoParticula, 0, Math.PI * 2)
            ctx.fill()
        }
        // Raio de luz
        const alpha = 0.3 * (1 - progresso)
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`
        ctx.beginPath()
        ctx.arc(x + size / 2, y + size / 2, size * 0.3 * (1 - progresso), 0, Math.PI * 2)
        ctx.fill()
    }
}
//FUNÇÃO MINERAR
function minerar(x, y) {
    const cellSize = Math.min(
        (canvas.width - 40) / colunas, (canvas.height - 40) / linhas)
    const offsetX = (canvas.width - cellSize * colunas) / 2
    const offsetY = (canvas.height - cellSize * linhas) / 2
    const col = Math.floor((x - offsetX) / cellSize)
    const row = Math.floor((y - offsetY) / cellSize)
    const index = row * colunas + col
    if (col < 0 || col >= colunas || row < 0 || row >= linhas) return
    if (mina[index].quebrado) return
    if (animacoes.some(a => a.index === index)) return
    // Cria animação de quebra
    criarAnimacao(index)
    // Calcula ganho (valor do minério * mineriosPorClique)
    const ganho = mina[index].valor * mineriosPorClique
    minerios += ganho

    let ganhoFinal = ganho * mineriosPorClique
    
    // Aplica buffs
    if (picoAtivo) {
        ganhoFinal *= 2
    }
    if (amuletoAtivo) {
        ganhoFinal *= 1.5
    }
    
    minerios += ganhoFinal
    // Nome do minério para o toast
    const nomeMinerio = tiposMinerio[mina[index].tipo].nome
    // Animação de "+X" flutuante
    const rect = canvas.getBoundingClientRect()
    const cx = (x / rect.width) * canvas.width
    const cy = (y / rect.height) * canvas.height
    criarTextoFlutuante('+' + ganho + ' ' + nomeMinerio, cx, cy)
    atualizarUI()
    salvarJogo()
}
// ===== TEXTO FLUTUANTE =====
let textosFlutuantes = []

function criarTextoFlutuante(texto, x, y) {
    textosFlutuantes.push({
        texto: texto,
        x: x,
        y: y,
        progresso: 0,
        duracao: 60 // frames
    })
}

function atualizarTextosFlutuantes() {
    for (let i = textosFlutuantes.length - 1; i >= 0; i--) {
        const t = textosFlutuantes[i]
        t.progresso++
            t.y -= 0.5 // sobe devagar
        if (t.progresso >= t.duracao) {
            textosFlutuantes.splice(i, 1)
        }
    }
}

function desenharTextosFlutuantes() {
    for (const t of textosFlutuantes) {
        const alpha = 1 - t.progresso / t.duracao
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`
        ctx.font = 'bold 24px sans-serif'
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.shadowBlur = 10
        ctx.fillText(t.texto, t.x, t.y)
        ctx.shadowBlur = 0
    }
}
// ===== DESENHAR =====
function desenhar() {
    ctx.fillStyle = '#1a1a2a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const cellSize = Math.min(
        (canvas.width - 40) / colunas, (canvas.height - 40) / linhas)
    const offsetX = (canvas.width - cellSize * colunas) / 2
    const offsetY = (canvas.height - cellSize * linhas) / 2
    // Atualiza animações
    atualizarAnimacoes()
    atualizarTextosFlutuantes()
    for (let i = 0; i < mina.length; i++) {
        const row = Math.floor(i / colunas)
        const col = i % colunas
        const x = offsetX + col * cellSize
        const y = offsetY + row * cellSize
        const temAnimacao = animacoes.some(a => a.index === i)
        if (temAnimacao) continue
        if (mina[i].quebrado) {
            ctx.fillStyle = '#1a1a2a'
            ctx.fillRect(x, y, cellSize, cellSize)
            ctx.strokeStyle = '#2a2a3a'
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, cellSize, cellSize)
        } else {
            const tipo = mina[i].tipo
            const cor = tiposMinerio[tipo].cor
            const corEscura = tiposMinerio[tipo].corEscura
            const brilho = tiposMinerio[tipo].brilho
            // Fundo escuro
            ctx.fillStyle = corEscura
            ctx.fillRect(x, y, cellSize, cellSize)
            // Gradiente
            const gradiente = ctx.createRadialGradient(x + cellSize * 0.3, y + cellSize * 0.3, 0, x + cellSize * 0.3, y + cellSize * 0.3, cellSize * 0.6)
            gradiente.addColorStop(0, cor)
            gradiente.addColorStop(1, corEscura)
            ctx.fillStyle = gradiente
            ctx.fillRect(x, y, cellSize, cellSize)
            // Brilho
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
            ctx.fillRect(x + 2, y + 2, cellSize * 0.3, cellSize * 0.15)
            // Brilho do minério (mais forte para minérios raros)
            if (tipo >= 5) {
                const alpha = 0.1 + (tipo - 4) * 0.02
                ctx.fillStyle = `rgba(255, 255, 200, ${Math.min(alpha, 0.3)})`
                ctx.beginPath()
                ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.2, 0, Math.PI * 2)
                ctx.fill()
            }
            ctx.strokeStyle = '#2a3a2a'
            ctx.lineWidth = 2
            ctx.strokeRect(x, y, cellSize, cellSize)
        }
    }
    // Desenha animações por cima
    desenharAnimacoes()
    desenharTextosFlutuantes()
}
// ===== LOOP =====
function gameLoop() {
    desenhar()
    requestAnimationFrame(gameLoop)
}
gameLoop()
// ===== TOAST =====
let toastTimeout = null

function mostrarToast(mensagem, tipo = 'erro') {
    const toast = document.getElementById('toast')
    toast.textContent = mensagem
    toast.className = 'toast ' + tipo + ' mostrar'
    clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => {
        toast.className = 'toast'
    }, 1500)
}
// ===== FUNÇÕES DO JOGO =====
function vender() {
    if (minerios === 0) {
        mostrarToast('Sem minérios para vender!', 'erro')
        return
    }
    const valor = minerios * 1
    dinheiro += valor
    minerios = 0
    atualizarUI()
    mostrarToast('💰 Vendeu por R$' + valor + '!', 'sucesso')
    salvarJogo()
}

function upgradePicareta() {
    const preco = 50 * picaretaNivel
    if (dinheiro < preco) {
        mostrarToast('Precisa de R$' + preco + '!', 'erro')
        return
    }
    dinheiro -= preco
    picaretaNivel += 1
    mineriosPorClique = picaretaNivel
    atualizarUI()
    mostrarToast('⛏️ Picareta nível ' + picaretaNivel + '!', 'sucesso')
    salvarJogo()
}

function upgradeMineiro() {
    const preco = 100 * (mineiros + 1)
    if (dinheiro < preco) {
        mostrarToast('Precisa de R$' + preco + '!', 'erro')
        return
    }
    dinheiro -= preco
    mineiros += 1
    atualizarUI()
    mostrarToast('👷 Mineiro contratado!', 'sucesso')
}

function upgradeProfundidade() {
    const preco = 200 * profundidade
    if (dinheiro < preco) {
        mostrarToast('Precisa de R$' + preco + '!', 'erro')
        return
    }
    dinheiro -= preco
    profundidade += 1
    resetarMina()
    atualizarUI()
    mostrarToast('⬇️ Profundidade ' + profundidade + '!', 'sucesso')
}

function atualizarUI() {
    document.getElementById('dinheiro').textContent = dinheiro
    document.getElementById('minerios').textContent = minerios
    document.getElementById('precoPicareta').textContent = 'R$' + (50 * picaretaNivel)
    document.getElementById('precoMineiro').textContent = 'R$' + (100 * (mineiros + 1))
    document.getElementById('precoProfundidade').textContent = 'R$' + (200 * profundidade)
    document.getElementById('camadaAtual').textContent = profundidade
    
    const melhorTipo = Math.min(profundidade, tiposMinerio.length) - 1
    const melhorNome = tiposMinerio[melhorTipo].nome
    document.getElementById('mineriosPorClique').textContent = 
        mineriosPorClique + ' (' + melhorNome + ') + ' + (mineiros > 0 ? mineiros + ' auto' : '0 auto')
    
    // Atualiza o status do auto-miner
    atualizarToggleAutoMiner()
}
// ===== FUNÇÕES AUTO-MINER =====
function toggleAutoMiner() {
    if (!autoMinerDesbloqueado) {
        // Tenta comprar o auto-miner
        if (dinheiro >= autoMinerPreco) {
            dinheiro -= autoMinerPreco
            autoMinerDesbloqueado = true
            atualizarUI()
            atualizarToggleAutoMiner()
            mostrarToast('🤖 Auto-Miner desbloqueado!', 'sucesso')
        } else {
            mostrarToast('Precisa de R$' + autoMinerPreco + ' para desbloquear!', 'erro')
        }
        return
    }
    
    // Se já está desbloqueado, alterna ligar/desligar
    autoMinerAtivo = !autoMinerAtivo
    
    if (autoMinerAtivo) {
        // Liga o auto-miner
        autoMinerInterval = setInterval(() => {
            // Minera um bloco aleatório
            const disponiveis = mina.map((b, i) => b.quebrado ? -1 : i).filter(i => i >= 0)
            if (disponiveis.length === 0) {
                resetarMina()
                mostrarToast('🔄 Mina regenerada!', 'sucesso')
                return
            }
            const index = disponiveis[Math.floor(Math.random() * disponiveis.length)]
            const ganho = mina[index].valor * mineriosPorClique
            minerios += ganho
            const nomeMinerio = tiposMinerio[mina[index].tipo].nome
            
            // Animação de quebra no bloco aleatório
            criarAnimacao(index)
            
            // Texto flutuante
            const cellSize = Math.min(
                (canvas.width - 40) / colunas,
                (canvas.height - 40) / linhas
            )
            const offsetX = (canvas.width - cellSize * colunas) / 2
            const offsetY = (canvas.height - cellSize * linhas) / 2
            const row = Math.floor(index / colunas)
            const col = index % colunas
            const cx = offsetX + col * cellSize + cellSize / 2
            const cy = offsetY + row * cellSize + cellSize / 2
            criarTextoFlutuante('+' + ganho, cx, cy)
            
            atualizarUI()
            salvarJogo()
        }, 1000) // Minera a cada 1 segundo
        
        mostrarToast('🤖 Auto-Miner LIGADO!', 'sucesso')
    } else {
        // Desliga o auto-miner
        clearInterval(autoMinerInterval)
        autoMinerInterval = null
        mostrarToast('🤖 Auto-Miner DESLIGADO!', 'erro')
    }
    
    atualizarToggleAutoMiner()
}

function atualizarToggleAutoMiner() {
    const btn = document.getElementById('btnAutoMiner')
    const status = document.getElementById('autoMinerStatus')
    
    if (!autoMinerDesbloqueado) {
        btn.textContent = '🔒 Comprar Auto-Miner'
        btn.className = 'btn-auto-miner bloqueado'
        status.textContent = 'R$' + autoMinerPreco
        status.style.color = '#aa6666'
    } else if (autoMinerAtivo) {
        btn.textContent = '🔴 Auto-Miner: LIGADO'
        btn.className = 'btn-auto-miner ativo'
        status.textContent = '⏳ 1s/bloco'
        status.style.color = '#f87171'
    } else {
        btn.textContent = '🟢 Auto-Miner: DESLIGADO'
        btn.className = 'btn-auto-miner'
        status.textContent = 'Clique para ligar'
        status.style.color = '#4ade80'
    }
}

// ===== EVENTOS =====
document.getElementById('btnMinerar').addEventListener('click', function() {
    const disponiveis = mina.map((b, i) => b.quebrado ? -1 : i).filter(i => i >= 0)
    if (disponiveis.length === 0) {
        resetarMina()
        mostrarToast('🔄 Mina regenerada!', 'sucesso')
        return
    }
    const index = disponiveis[Math.floor(Math.random() * disponiveis.length)]
    const ganho = mina[index].valor * mineriosPorClique
    minerios += ganho
    const nomeMinerio = tiposMinerio[mina[index].tipo].nome
    // Animação de quebra no bloco aleatório
    criarAnimacao(index)
    // Texto flutuante
    const cellSize = Math.min(
        (canvas.width - 40) / colunas, (canvas.height - 40) / linhas)
    const offsetX = (canvas.width - cellSize * colunas) / 2
    const offsetY = (canvas.height - cellSize * linhas) / 2
    const row = Math.floor(index / colunas)
    const col = index % colunas
    const cx = offsetX + col * cellSize + cellSize / 2
    const cy = offsetY + row * cellSize + cellSize / 2
    criarTextoFlutuante('+' + ganho + ' ' + nomeMinerio, cx, cy)
    atualizarUI()
    mostrarToast('⛏️ +' + ganho + ' ' + nomeMinerio + '!', 'sucesso')
    salvarJogo()
})
document.getElementById('btnVender').addEventListener('click', vender)
document.getElementById('upgradePicareta').addEventListener('click', upgradePicareta)
document.getElementById('upgradeMineiro').addEventListener('click', upgradeMineiro)
document.getElementById('upgradeProfundidade').addEventListener('click', upgradeProfundidade)

document.getElementById('btnAutoMiner').addEventListener('click', toggleAutoMiner)

// ===== SISTEMA IDLE (MINEIROS) =====
setInterval(() => {
    if (mineiros > 0) {
        const ganho = mineiros * 1
        minerios += ganho
        atualizarUI()
        salvarJogo()
    }
}, 1000)

// ===== LOJA =====
let marteloQtd = 0
let dinamiteQtd = 0
let picoAtivo = false
let picoTempo = 0
let amuletoAtivo = false
let amuletoTempo = 0
let minaSecretaDesbloqueada = false

function abrirLoja() {
    document.getElementById('overlayLoja').classList.add('ativo')
    document.getElementById('popupLoja').classList.add('ativo')
    document.getElementById('lojaDinheiro').textContent = 'R$ ' + dinheiro
    atualizarBotoesLoja()
}

function fecharLoja() {
    document.getElementById('overlayLoja').classList.remove('ativo')
    document.getElementById('popupLoja').classList.remove('ativo')
}

function atualizarBotoesLoja() {
    const itens = [
        { id: 'Martelo', preco: 500, qtd: marteloQtd },
        { id: 'Dinamite', preco: 1000, qtd: dinamiteQtd },
        { id: 'Pico', preco: 2000, qtd: picoAtivo ? 1 : 0 },
        { id: 'Amuleto', preco: 5000, qtd: amuletoAtivo ? 1 : 0 },
        { id: 'MinaSecreta', preco: 10000, qtd: minaSecretaDesbloqueada ? 1 : 0 }
    ]
    
    itens.forEach(item => {
        const btn = document.getElementById('btnComprar' + item.id)
        const precoSpan = document.getElementById('preco' + item.id)
        const itemDiv = document.getElementById('item' + item.id)
        
        if (item.id === 'MinaSecreta' && minaSecretaDesbloqueada) {
            btn.textContent = '✅ Desbloqueado'
            btn.className = 'btn-comprar indisponivel'
            itemDiv.classList.add('comprado')
            return
        }
        
        if (item.id === 'Pico' && picoAtivo) {
            btn.textContent = '⏳ Ativo'
            btn.className = 'btn-comprar indisponivel'
            return
        }
        
        if (item.id === 'Amuleto' && amuletoAtivo) {
            btn.textContent = '⏳ Ativo'
            btn.className = 'btn-comprar indisponivel'
            return
        }
        
        if (dinheiro >= item.preco) {
            btn.textContent = 'Comprar'
            btn.className = 'btn-comprar'
            btn.disabled = false
        } else {
            btn.textContent = 'R$' + item.preco
            btn.className = 'btn-comprar indisponivel'
            btn.disabled = true
        }
        
        precoSpan.textContent = 'R$' + item.preco
    })
}

function comprarItem(nome, preco, callback) {
    if (dinheiro >= preco) {
        dinheiro -= preco
        callback()
        atualizarUI()
        salvarJogo()
        document.getElementById('lojaDinheiro').textContent = 'R$ ' + dinheiro
        atualizarBotoesLoja()
        mostrarToast('🛒 Comprou ' + nome + '!', 'sucesso')
    } else {
        mostrarToast('Dinheiro insuficiente!', 'erro')
    }
}

// ===== ITENS DA LOJA =====
document.getElementById('btnComprarMartelo').addEventListener('click', function() {
    comprarItem('Martelo', 500, function() {
        marteloQtd++
        // Usa o martelo imediatamente
        for (let i = 0; i < 3; i++) {
            const disponiveis = mina.map((b, idx) => b.quebrado ? -1 : idx).filter(idx => idx >= 0)
            if (disponiveis.length === 0) break
            const index = disponiveis[Math.floor(Math.random() * disponiveis.length)]
            const ganho = mina[index].valor * mineriosPorClique
            minerios += ganho
            criarAnimacao(index)
        }
        mostrarToast('🔨 Martelo usado! +3 blocos quebrados!', 'sucesso')
    })
})

document.getElementById('btnComprarDinamite').addEventListener('click', function() {
    comprarItem('Dinamite', 1000, function() {
        dinamiteQtd++
        // Usa a dinamite imediatamente
        const disponiveis = mina.map((b, idx) => b.quebrado ? -1 : idx).filter(idx => idx >= 0)
        if (disponiveis.length > 0) {
            // Quebra todos os blocos disponíveis
            disponiveis.forEach(index => {
                const ganho = mina[index].valor * mineriosPorClique
                minerios += ganho
                criarAnimacao(index)
            })
        }
        mostrarToast('💥 Dinamite usada! ' + disponiveis.length + ' blocos quebrados!', 'sucesso')
    })
})

document.getElementById('btnComprarPico').addEventListener('click', function() {
    comprarItem('Pico de Diamante', 2000, function() {
        picoAtivo = true
        picoTempo = 30
        mostrarToast('💎 Pico de Diamante ativado por 30s!', 'sucesso')
    })
})

document.getElementById('btnComprarAmuleto').addEventListener('click', function() {
    comprarItem('Amuleto da Sorte', 5000, function() {
        amuletoAtivo = true
        amuletoTempo = 60
        mostrarToast('🍀 Amuleto da Sorte ativado por 60s!', 'sucesso')
    })
})

document.getElementById('btnComprarMinaSecreta').addEventListener('click', function() {
    comprarItem('Mina Secreta', 10000, function() {
        minaSecretaDesbloqueada = true
        profundidade = Math.max(profundidade, 15)
        resetarMina()
        mostrarToast('🔓 Mina Secreta desbloqueada! Novos minérios!', 'sucesso')
    })
})

// ===== EVENTOS DA LOJA =====
document.getElementById('btnAbrirLoja').addEventListener('click', abrirLoja)
document.getElementById('btnFecharLoja').addEventListener('click', fecharLoja)
document.getElementById('overlayLoja').addEventListener('click', fecharLoja)

// ===== SISTEMA DE BUFFS =====
setInterval(() => {
    if (picoAtivo) {
        picoTempo--
        if (picoTempo <= 0) {
            picoAtivo = false
            mostrarToast('💎 Pico de Diamante acabou!', 'erro')
            atualizarBotoesLoja()
        }
    }
    
    if (amuletoAtivo) {
        amuletoTempo--
        if (amuletoTempo <= 0) {
            amuletoAtivo = false
            mostrarToast('🍀 Amuleto da Sorte acabou!', 'erro')
            atualizarBotoesLoja()
        }
    }
}, 1000)

// ===== BANCO =====
let bancoSaldo = 0
let bancoTotalAcumulado = 0
let bancoNivelJuros = 1
let bancoHistorico = []
let bancoJurosBase = 0.01 // 1% por segundo

function abrirBanco() {
    document.getElementById('overlayBanco').classList.add('ativo')
    document.getElementById('popupBanco').classList.add('ativo')
    atualizarBanco()
}

function fecharBanco() {
    document.getElementById('overlayBanco').classList.remove('ativo')
    document.getElementById('popupBanco').classList.remove('ativo')
}

function atualizarBanco() {
    document.getElementById('bancoSaldo').textContent = 'R$ ' + bancoSaldo.toFixed(1)
    document.getElementById('bancoTotal').textContent = 'R$ ' + bancoTotalAcumulado.toFixed(1)
    document.getElementById('bancoJuros').textContent = (bancoJurosBase * bancoNivelJuros * 100).toFixed(1) + '%'
    document.getElementById('bancoNivelJuros').textContent = bancoNivelJuros
    document.getElementById('precoUpgradeJuros').textContent = (1000 * bancoNivelJuros)
    atualizarHistoricoBanco()
}

function atualizarHistoricoBanco() {
    const container = document.getElementById('bancoHistorico')
    if (bancoHistorico.length === 0) {
        container.innerHTML = '<span class="historico-vazio">Nenhuma transação ainda</span>'
        return
    }
    
    // Mostra as últimas 5 transações
    const ultimas = bancoHistorico.slice(-5).reverse()
    container.innerHTML = ultimas.map(item => {
        const classe = item.tipo === 'deposito' ? 'deposito' : 
                       item.tipo === 'saque' ? 'saque' : 'juros'
        return `<div class="historico-item ${classe}">${item.texto}</div>`
    }).join('')
}

function adicionarHistorico(tipo, texto) {
    bancoHistorico.push({ tipo, texto })
    if (bancoHistorico.length > 50) {
        bancoHistorico.shift()
    }
}

function depositar(valor) {
    if (valor === 'tudo') {
        valor = dinheiro
    }
    
    if (valor <= 0) {
        mostrarToast('Valor inválido!', 'erro')
        return
    }
    
    if (dinheiro < valor) {
        mostrarToast('Dinheiro insuficiente!', 'erro')
        return
    }
    
    dinheiro -= valor
    bancoSaldo += valor
    bancoTotalAcumulado += valor
    adicionarHistorico('deposito', '💰 Depósito: R$' + valor.toFixed(1))
    atualizarBanco()
    atualizarUI()
    salvarJogo()
    mostrarToast('💰 Depositou R$' + valor.toFixed(1) + ' no banco!', 'sucesso')
}

function sacar(valor) {
    if (valor === 'tudo') {
        valor = bancoSaldo
    }
    
    if (valor <= 0) {
        mostrarToast('Valor inválido!', 'erro')
        return
    }
    
    if (bancoSaldo < valor) {
        mostrarToast('Saldo insuficiente!', 'erro')
        return
    }
    
    bancoSaldo -= valor
    dinheiro += valor
    adicionarHistorico('saque', '🏦 Saque: R$' + valor.toFixed(1))
    atualizarBanco()
    atualizarUI()
    salvarJogo()
    mostrarToast('🏦 Sacou R$' + valor.toFixed(1) + ' do banco!', 'sucesso')
}

function upgradeJuros() {
    const preco = 1000 * bancoNivelJuros
    if (dinheiro < preco) {
        mostrarToast('Precisa de R$' + preco + ' para melhorar os juros!', 'erro')
        return
    }
    dinheiro -= preco
    bancoNivelJuros += 1
    atualizarBanco()
    atualizarUI()
    salvarJogo()
    mostrarToast('📈 Juros aumentados para ' + (bancoJurosBase * bancoNivelJuros * 100).toFixed(1) + '%!', 'sucesso')
}

// ===== EVENTOS DO BANCO =====
document.getElementById('btnAbrirBanco').addEventListener('click', abrirBanco)
document.getElementById('btnFecharBanco').addEventListener('click', fecharBanco)
document.getElementById('overlayBanco').addEventListener('click', fecharBanco)

document.getElementById('btnDepositar25').addEventListener('click', () => depositar(25))
document.getElementById('btnDepositar100').addEventListener('click', () => depositar(100))
document.getElementById('btnDepositar500').addEventListener('click', () => depositar(500))
document.getElementById('btnDepositarTudo').addEventListener('click', () => depositar('tudo'))

document.getElementById('btnSacar25').addEventListener('click', () => sacar(25))
document.getElementById('btnSacar100').addEventListener('click', () => sacar(100))
document.getElementById('btnSacar500').addEventListener('click', () => sacar(500))
document.getElementById('btnSacarTudo').addEventListener('click', () => sacar('tudo'))

document.getElementById('btnUpgradeJuros').addEventListener('click', upgradeJuros)

// ===== SISTEMA DE JUROS (roda a cada 1 segundo) =====
setInterval(() => {
    if (bancoSaldo > 0) {
        const juros = bancoSaldo * (bancoJurosBase * bancoNivelJuros)
        bancoSaldo += juros
        bancoTotalAcumulado += juros
        adicionarHistorico('juros', '📈 Juros: +R$' + juros.toFixed(1))
        atualizarBanco()
        salvarJogo()
    }
}, 1000)

// ===== INICIAR =====
const saveCarregado = carregarJogo()
if (!saveCarregado) {
    inicializarMina()
}
atualizarUI()

// Salva automaticamente a cada 10 segundos (segurança extra)
setInterval(() => {
    salvarJogo()
}, 10000)