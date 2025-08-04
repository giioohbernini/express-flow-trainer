import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

// Dados estáticos
const WORDS = [
  "bruma", "horizonte", "fragmento", "nó", "origem",
  "penumbra", "semente", "rastro", "concha", "pulso",
  "espelho", "gravidade", "véu", "raiz", "frequência",
  "maré", "névoa", "relâmpago", "cicatriz", "fenda"
];

const READING_THEMES = [
  "A importância da escuta ativa nas conversas",
  "Como hábitos moldam nossa identidade",
  "O impacto da natureza no bem-estar mental",
  "Como o sono afeta a tomada de decisão",
  "O futuro das profissões com IA",
  "O papel da criatividade no ambiente corporativo",
  "Como a linguagem molda nossa percepção de realidade",
  "Mindfulness aplicado à rotina profissional",
  "A diferença entre empatia e simpatia",
  "Minimalismo digital: viver com menos notificações"
];

const EXPRESSION_THEMES = [
  "O que significa sucesso para mim?",
  "Como lido com mudanças inesperadas?",
  "O que aprendi com meu maior erro?",
  "O papel da empatia no mundo de hoje",
  "O que me inspira a continuar nos dias difíceis?",
  "Redes sociais aproximam ou afastam as pessoas?",
  "A importância da educação financeira",
  "O impacto da inteligência artificial na sociedade",
  "O futuro do trabalho remoto",
  "Por que precisamos falar mais sobre saúde mental?",
  "Uma habilidade que quero desenvolver este ano",
  "Algo pequeno que melhora meu dia",
  "Um hábito que mudou minha vida",
  "Se eu pudesse conversar com meu 'eu' do futuro",
  "Descreva um mundo ideal para você"
];

const PHASES = [
  { 
    name: "Mental Warm-up", 
    duration: 5 * 60, 
    description: "Associações livres com a palavra",
    objective: "Ativar criatividade e flexibilidade cognitiva, quebrando bloqueios iniciais"
  },
  { 
    name: "Active Reading", 
    duration: 10 * 60, 
    description: "6 min leitura + 4 min resumo",
    objective: "Treinar foco e compreensão rápida, desenvolvendo capacidade de síntese"
  },
  { 
    name: "Rapid Expression", 
    duration: 10 * 60, 
    description: "Fale sobre o tema proposto",
    objective: "Melhorar fluência verbal e reduzir autocensura ao falar em público"
  },
  { 
    name: "Quick Writing", 
    duration: 5 * 60, 
    description: "Escreva livremente sobre a palavra",
    objective: "Incentivar fluxo de escrita e consolidar ideias das etapas anteriores"
  }
];

const TOTAL_DURATION = 30 * 60; // 30 minutos

export default function ExpressionTrainer() {
  const [isRunning, setIsRunning] = useState(false);
  const [globalTime, setGlobalTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentWord, setCurrentWord] = useState(WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [currentReadingTheme, setCurrentReadingTheme] = useState(READING_THEMES[Math.floor(Math.random() * READING_THEMES.length)]);
  const [currentExpressionTheme, setCurrentExpressionTheme] = useState(EXPRESSION_THEMES[Math.floor(Math.random() * EXPRESSION_THEMES.length)]);
  const [associations, setAssociations] = useState('');
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const easyMDERef = useRef<EasyMDE | null>(null);

  // Inicializar EasyMDE
  useEffect(() => {
    if (editorRef.current && !easyMDERef.current) {
      easyMDERef.current = new EasyMDE({
        element: editorRef.current,
        minHeight: "80vh",
        spellChecker: false,
        autoDownloadFontAwesome: true,
        toolbar: ["bold", "italic", "heading", "unordered-list", "ordered-list", "preview", "side-by-side", "fullscreen"],
        previewRender: function(plainText: string) {
          // Usar o markdown parser padrão do EasyMDE
          return (easyMDERef.current as any)?.constructor?.prototype?.markdown?.(plainText) || plainText;
        }
      });
    }

    return () => {
      if (easyMDERef.current) {
        easyMDERef.current.cleanup();
        easyMDERef.current = null;
      }
    };
  }, []);

  // Timer global
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && globalTime < TOTAL_DURATION) {
      interval = setInterval(() => {
        setGlobalTime(prev => {
          const newTime = prev + 1;
          
          // Verificar mudança de fase
          let phaseTime = 0;
          let newPhase = 0;
          
          for (let i = 0; i < PHASES.length; i++) {
            if (newTime <= phaseTime + PHASES[i].duration) {
              newPhase = i;
              break;
            }
            phaseTime += PHASES[i].duration;
          }
          
          if (newPhase !== currentPhase) {
            setCurrentPhase(newPhase);
            playBeep();
          }
          
          // Fim da sessão
          if (newTime >= TOTAL_DURATION) {
            setIsRunning(false);
            playBeep();
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, globalTime, currentPhase]);

  const playBeep = () => {
    const audio = new Audio('https://www.soundjay.com/button/beep-07.wav');
    audio.play().catch(() => {
      // Ignore audio errors
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseProgress = () => {
    let phaseStartTime = 0;
    for (let i = 0; i < currentPhase; i++) {
      phaseStartTime += PHASES[i].duration;
    }
    const phaseElapsed = globalTime - phaseStartTime;
    const phaseProgress = Math.min((phaseElapsed / PHASES[currentPhase].duration) * 100, 100);
    return phaseProgress;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setGlobalTime(0);
    setCurrentPhase(0);
    setAssociations('');
    setCurrentWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setCurrentReadingTheme(READING_THEMES[Math.floor(Math.random() * READING_THEMES.length)]);
    setCurrentExpressionTheme(EXPRESSION_THEMES[Math.floor(Math.random() * EXPRESSION_THEMES.length)]);
  };

  const handleSkip = () => {
    if (currentPhase < PHASES.length - 1) {
      let newTime = 0;
      for (let i = 0; i <= currentPhase; i++) {
        newTime += PHASES[i].duration;
      }
      setGlobalTime(newTime);
      setCurrentPhase(currentPhase + 1);
      playBeep();
    }
  };

  const changeWord = () => {
    setCurrentWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
  };

  const changeExpressionTheme = () => {
    setCurrentExpressionTheme(EXPRESSION_THEMES[Math.floor(Math.random() * EXPRESSION_THEMES.length)]);
  };

  const getButtonVariant = () => {
    if (!isRunning && globalTime === 0) return 'default'; // Azul
    if (isRunning) return 'destructive'; // Vermelho
    return 'success'; // Verde para retomar
  };

  const getButtonText = () => {
    if (!isRunning && globalTime === 0) return 'Iniciar';
    if (isRunning) return 'Pausar';
    return 'Retomar';
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 0: // Mental Warm-up
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Palavra: {currentWord}</h3>
              <Button onClick={changeWord} variant="outline" className="mb-4">
                Trocar palavra
              </Button>
            </div>
            <Textarea
              placeholder="Digite suas associações livres com essa palavra..."
              value={associations}
              onChange={(e) => setAssociations(e.target.value)}
              className="min-h-40"
            />
          </div>
        );
      
      case 1: // Active Reading
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Tema de leitura:</h3>
              <p className="text-lg mb-4 p-4 bg-muted rounded">{currentReadingTheme}</p>
              <p className="text-sm text-muted-foreground">
                Leia sobre este tema por 6 minutos, depois resume por 4 minutos
              </p>
            </div>
          </div>
        );
      
      case 2: // Rapid Expression
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Tema para fala:</h3>
              <p className="text-lg mb-4 p-4 bg-muted rounded">{currentExpressionTheme}</p>
              <Button onClick={changeExpressionTheme} variant="outline" className="mb-4">
                Trocar tema
              </Button>
              <p className="text-sm text-muted-foreground">
                Fale sobre este tema em voz alta
              </p>
            </div>
          </div>
        );
      
      case 3: // Quick Writing
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Palavra-estímulo: {currentWord}</h3>
              <Button onClick={changeWord} variant="outline" className="mb-4">
                Trocar palavra
              </Button>
              <p className="text-sm text-muted-foreground">
                Escreva livremente sobre essa palavra
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        {/* Painel Esquerdo */}
        <div className="w-full lg:w-1/2 space-y-8 p-8">
          {/* Cronômetro Global */}
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-4xl font-bold mb-4">{formatTime(globalTime)} / 30:00</h2>
              <Progress value={(globalTime / TOTAL_DURATION) * 100} className="mb-4" />
            </CardContent>
          </Card>

          {/* Fase Atual */}
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Etapa {currentPhase + 1}/4: {PHASES[currentPhase].name}
                </h2>
                <p className="text-muted-foreground mb-2">
                  {PHASES[currentPhase].description}
                </p>
                <p className="text-sm text-primary/80 mb-4 italic">
                  {PHASES[currentPhase].objective}
                </p>
                <Progress value={getPhaseProgress()} className="mb-4" />
              </div>
              
              {renderPhaseContent()}
            </CardContent>
          </Card>

          {/* Controles */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleStartPause}
              variant={getButtonVariant()}
              size="lg"
              className="text-lg px-8"
            >
              {getButtonText()}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="text-lg px-8"
            >
              Reiniciar
            </Button>
            
            {currentPhase < PHASES.length - 1 && (
              <Button
                onClick={handleSkip}
                variant="warning"
                size="lg"
                className="text-lg px-8"
              >
                Pular
              </Button>
            )}
          </div>
        </div>

        {/* Painel Direito - Editor */}
        <div className="w-full lg:w-1/2 p-8 border-l border-border">
          <h2 className="text-xl font-semibold mb-4">Anotações Gerais</h2>
          <textarea
            ref={editorRef}
            placeholder="Use este espaço para suas anotações durante a sessão..."
          />
        </div>
      </div>
    </div>
  );
}