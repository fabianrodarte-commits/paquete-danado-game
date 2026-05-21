import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://jsoqjkgrxtxzbxpfwmqu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzb3Fqa2dyeHR4emJ4cGZ3bXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzgzNTYsImV4cCI6MjA5NDk1NDM1Nn0.3U_0vf5KWh-Scv-7fvmELjyeR2HvUxCFDPoKntaXP0E";
const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

async function guardarResultado(datos) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/resultados`, {
      method: "POST",
      headers,
      body: JSON.stringify(datos),
    });
  } catch (e) { console.error(e); }
}

async function obtenerResultados() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/resultados?select=*&order=puntaje.desc,fecha.asc`, { headers });
    return await res.json();
  } catch { return []; }
}

const questions = [
  { q: "Encuentras un paquete con la caja rota pero el producto adentro está completamente bien. ¿Qué haces?", options: ["Lo clasificas como dañado y lo envías a devolución", "Reparas el embalaje con cinta Meli o caja nueva y lo reincorporas al flujo", "Lo dejas a un lado para que lo revise el Team Leader", "Lo descartas porque el embalaje está roto"], answer: 1, explanation: "Si el producto está intacto, debes reempacar y registrar el reacondicionamiento. ¡Nunca clasificar como dañado solo por la caja!" },
  { q: "¿Cuál es la primera acción que debes hacer con un paquete dañado antes de cualquier otra cosa?", options: ["Tomar una foto y subirla", "Reportarlo al Team Leader inmediatamente", "Intentar siempre la reparación o reacondicionamiento antes de declararlo dañado", "Registrarlo directamente como dañado en el sistema"], answer: 2, explanation: "Siempre se debe intentar la reparación ANTES de declarar un paquete como dañado, independientemente del origen." },
  { q: "¿Dónde debes registrar un paquete dañado en el sistema?", options: ["En el correo del supervisor", "En el módulo de Solución de Problemas en Logistics", "En una hoja de Excel manual", "En el módulo de devoluciones directamente"], answer: 1, explanation: "Todos los paquetes dañados deben registrarse en el módulo de 'Solución de Problemas' en Logistics, con foto y datos." },
  { q: "¿Qué material puedes usar para reparar un daño superficial leve en el embalaje?", options: ["Cualquier cinta disponible en la operación", "Solo cinta Mercado Libre o cinta gorilla", "Cinta adhesiva normal o plástico", "Grapas y pegamento industrial"], answer: 1, explanation: "Para daños superficiales leves solo se utiliza cinta Mercado Libre o cinta gorilla." },
  { q: "Reparaste correctamente un paquete dañado. ¿A dónde lo envías después?", options: ["Al área de devoluciones para revisión", "Lo dejas en PS hasta que lo apruebe el TL", "Lo regresas al flujo de sorting para ser despachado", "Lo envías directo a destrucción"], answer: 2, explanation: "Una vez reparado, el paquete debe volver al flujo de sorting para continuar su despacho al buyer." },
  { q: "¿Está permitido escribir en el embalaje o producto del paquete para identificarlo?", options: ["Sí, con marcador permanente", "Sí, solo si el embalaje está muy dañado", "No, está EXPRESAMENTE prohibido escribir en el embalaje o producto", "Solo si el Team Leader lo autoriza"], answer: 2, explanation: "Está EXPRESAMENTE prohibido escribir en el embalaje o producto, independientemente de su condición." },
  { q: "Al registrar el daño en el HH, ¿qué debes hacer después de seleccionar el tipo de daño?", options: ["Finalizar el caso y enviarlo a devolución", "Tomar una foto donde se puedan analizar los daños del paquete", "Esperar la aprobación del TL antes de continuar", "Imprimir la etiqueta de destino automáticamente"], answer: 1, explanation: "Después de seleccionar el tipo de daño, debes tomar una foto clara del paquete y luego continuar." },
  { q: "¿En cuántas horas debes registrar el daño en el sistema desde que llegó el paquete?", options: ["48 horas", "72 horas", "24 horas", "12 horas"], answer: 2, explanation: "Todos los daños deben registrarse dentro de las 24 horas posteriores al arribo. Si no, se clasifica automáticamente como avería service center." },
  { q: "El paquete no se puede reparar completamente. ¿Cuáles son las opciones de destino?", options: ["Solo devolución o destrucción", "Entrega parcial, para devolver, para donar o para destrucción", "Solo destrucción si está muy dañado", "Donación o devolución, nunca destrucción"], answer: 1, explanation: "Cuando el paquete no se puede reparar, el PS puede elegir entre: entrega parcial, devolver, donar o destruir." },
  { q: "Un paquete tiene 3 productos adentro y solo 1 está dañado. ¿Qué opción seleccionas?", options: ["Para destrucción de todo el paquete", "Para devolución completa al seller", "Entrega parcial: los productos en buen estado se entregan y el dañado se destruye", "Clasificas todo el paquete como dañado"], answer: 2, explanation: "Cuando hay más de 1 producto y no todos están dañados, se selecciona 'Entrega Parcial'." },
  { q: "¿Quién debe aprobar el destino final de un paquete dañado registrado en el sistema?", options: ["El Problem Solver que registró el caso", "El equipo de inventario", "El Team Leader MELI, en un máximo de 24 horas", "El área de devoluciones"], answer: 2, explanation: "El TL MELI aprueba los casos como máximo a 24h de su creación." },
  { q: "Llega un paquete con etiqueta roja 'Revisado por FBM - Apto para envío'. ¿Qué haces?", options: ["Lo envías al área de PS porque tiene daños visibles", "Lo clasificas como dañado y abres un caso", "Lo dejas continuar el flujo normal aunque tenga daños visibles", "Lo devuelves al seller por las dudas"], answer: 2, explanation: "Los paquetes con etiqueta roja FBM deben continuar el flujo normal. El comprador ya fue informado y aceptó recibirlo." },
  { q: "¿Puedes dejar los paquetes en el suelo mientras los procesas en el área de PS?", options: ["Sí, si es por poco tiempo", "Sí, si el área está limpia", "No, siempre deben estar en baker carts, jaulas, pallets u otra superficie", "Solo si son paquetes pequeños"], answer: 2, explanation: "No se deben dejar paquetes en el suelo. Siempre en baker carts, jaulas o pallets para cuidar su integridad." },
  { q: "¿Dónde debes abrir un paquete si es necesario revisar su contenido?", options: ["En cualquier lugar de la operación", "En el área de sorting para ganar tiempo", "Obligatoriamente en el área de tratativa designada para PS", "Junto a la cinta transportadora"], answer: 2, explanation: "La apertura de paquetes debe hacerse obligatoriamente en el área de tratativa, señalizada y monitoreada por CCTV." },
  { q: "Detectas un paquete con producto líquido derramado. ¿A dónde va este paquete?", options: ["Lo reparas con cinta y lo mandas a sorting", "Lo registras como dañado y va a devolución, donación o destrucción según aplique", "Lo dejas en espera hasta que llegue el TL", "Lo envías directamente al buyer con una nota"], answer: 1, explanation: "Los productos líquidos dañados se registran y dirigen a devolución, donación o destrucción. En MLM van directo a destrucción." }
];

const TOTAL_TIME = 15;
const COLORS = ["#FFD700","#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#DDA0DD","#F7DC6F","#82E0AA"];
const medalEmoji = ["🥇","🥈","🥉"];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function App() {
  const [screen, setScreen] = useState("home");
  const [nameInput, setNameInput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [shuffledQs, setShuffledQs] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLB, setLoadingLB] = useState(false);
  const timerRef = useRef(null);

  const fetchLeaderboard = async () => {
    setLoadingLB(true);
    const data = await obtenerResultados();
    setLeaderboard(Array.isArray(data) ? data : []);
    setLoadingLB(false);
  };

  const startGame = () => {
    const name = nameInput.trim();
    if (!name) return;
    setPlayerName(name);
    const qs = shuffle(questions).slice(0, 10);
    setShuffledQs(qs);
    setCurrentQ(0);
    setScore(0);
    setAnswers([]);
    setSelected(null);
    setShowResult(false);
    setTimeLeft(TOTAL_TIME);
    setScreen("playing");
  };

  useEffect(() => {
    if (screen !== "playing" || showResult) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, currentQ, showResult]);

  const handleAnswer = (idx) => {
    clearInterval(timerRef.current);
    setSelected(idx);
    setShowResult(true);
    const q = shuffledQs[currentQ];
    const correct = idx === q.answer;
    const pts = correct ? Math.max(1, timeLeft) : 0;
    const newScore = score + pts;
    const newAnswers = [...answers, { correct, pts }];
    setScore(newScore);
    setAnswers(newAnswers);

    setTimeout(async () => {
      if (currentQ + 1 >= shuffledQs.length) {
        const correctCount = newAnswers.filter(a => a.correct).length;
        await guardarResultado({
          nombre: playerName,
          puntaje: newScore,
          correctas: correctCount,
          total: 10,
          porcentaje: Math.round((correctCount / 10) * 100),
        });
        setScreen("done");
      } else {
        setCurrentQ(q => q + 1);
        setSelected(null);
        setShowResult(false);
        setTimeLeft(TOTAL_TIME);
      }
    }, 2800);
  };

  // ── HOME ──
  if (screen === "home") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ fontSize:64, marginBottom:8 }}>📦</div>
      <h1 style={{ color:"#FFD700", fontSize:28, fontWeight:900, textAlign:"center", margin:"0 0 4px", textShadow:"0 2px 10px rgba(255,215,0,0.5)" }}>PAQUETE DAÑADO</h1>
      <p style={{ color:"#aaa", fontSize:13, marginBottom:32, textAlign:"center" }}>El juego del Problem Solver · 10 preguntas · 15s c/u</p>
      <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:16, padding:24, width:"100%", maxWidth:380, marginBottom:20 }}>
        <p style={{ color:"#FFD700", fontWeight:700, marginBottom:12, fontSize:14 }}>👤 ¿Cómo te llamas?</p>
        <input
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && startGame()}
          placeholder="Escribe tu nombre..."
          style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"2px solid rgba(255,215,0,0.3)", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:16, outline:"none", boxSizing:"border-box" }}
        />
      </div>
      <button onClick={startGame} disabled={!nameInput.trim()} style={{ padding:"14px 48px", borderRadius:50, background: nameInput.trim() ? "linear-gradient(135deg,#FFD700,#FFA500)" : "#555", color:"#000", fontWeight:900, fontSize:18, border:"none", cursor: nameInput.trim() ? "pointer" : "not-allowed", boxShadow:"0 4px 20px rgba(255,215,0,0.4)", marginBottom:16 }}>
        🚀 JUGAR
      </button>
      <button onClick={() => { fetchLeaderboard(); setScreen("leaderboard"); }} style={{ padding:"10px 28px", borderRadius:50, background:"rgba(255,255,255,0.08)", color:"#aaa", fontWeight:700, fontSize:14, border:"2px solid rgba(255,255,255,0.15)", cursor:"pointer" }}>
        🏆 Ver Tabla de Resultados
      </button>
    </div>
  );

  // ── PLAYING ──
  if (screen === "playing" && shuffledQs.length > 0) {
    const q = shuffledQs[currentQ];
    const timerPct = (timeLeft / TOTAL_TIME) * 100;
    const timerColor = timeLeft > 8 ? "#4ECDC4" : timeLeft > 4 ? "#FFD700" : "#FF6B6B";
    const playerColor = COLORS[playerName.charCodeAt(0) % COLORS.length];
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)", display:"flex", flexDirection:"column", padding:16, fontFamily:"'Segoe UI',sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ background:playerColor, color:"#000", padding:"6px 14px", borderRadius:20, fontWeight:800, fontSize:13 }}>🎮 {playerName}</div>
          <div style={{ color:"#aaa", fontSize:13 }}>❓ {currentQ+1} / 10</div>
          <div style={{ color:timerColor, fontWeight:900, fontSize:18 }}>⏱ {timeLeft}s</div>
        </div>
        <div style={{ height:6, background:"rgba(255,255,255,0.1)", borderRadius:3, marginBottom:14, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${timerPct}%`, background:timerColor, borderRadius:3, transition:"width 1s linear" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{ color:"#4ECDC4", fontSize:13, fontWeight:700 }}>✅ {answers.filter(a=>a.correct).length} correctas</span>
          <span style={{ color:"#FFD700", fontSize:13, fontWeight:700 }}>⭐ {score} pts</span>
        </div>
        <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:16, padding:18, marginBottom:14 }}>
          <p style={{ color:"#fff", fontSize:15, fontWeight:600, lineHeight:1.5, margin:0 }}>{q.q}</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {q.options.map((opt, i) => {
            let bg = "rgba(255,255,255,0.07)", border = "2px solid rgba(255,255,255,0.1)", color = "#fff";
            if (showResult) {
              if (i === q.answer) { bg = "rgba(78,205,196,0.25)"; border = "2px solid #4ECDC4"; color = "#4ECDC4"; }
              else if (i === selected) { bg = "rgba(255,107,107,0.25)"; border = "2px solid #FF6B6B"; color = "#FF6B6B"; }
            }
            return (
              <button key={i} onClick={() => !showResult && handleAnswer(i)}
                style={{ background:bg, border, borderRadius:12, padding:"14px 16px", color, fontSize:14, textAlign:"left", cursor:showResult?"default":"pointer", fontWeight:500, lineHeight:1.4, transition:"all 0.2s" }}>
                <span style={{ fontWeight:800, marginRight:8 }}>{["A","B","C","D"][i]}.</span>{opt}
              </button>
            );
          })}
        </div>
        {showResult && (
          <div style={{ background: selected===q.answer ? "rgba(78,205,196,0.15)" : "rgba(255,107,107,0.15)", border:`1px solid ${selected===q.answer?"#4ECDC4":"#FF6B6B"}`, borderRadius:12, padding:14, marginTop:12 }}>
            <p style={{ color:selected===q.answer?"#4ECDC4":"#FF6B6B", fontWeight:700, fontSize:13, margin:"0 0 4px" }}>
              {selected===q.answer ? `✅ +${Math.max(1,timeLeft)} puntos` : selected===null ? "⏰ ¡Tiempo agotado!" : "❌ Respuesta incorrecta"}
            </p>
            <p style={{ color:"#ccc", fontSize:12, margin:0, lineHeight:1.5 }}>{q.explanation}</p>
          </div>
        )}
      </div>
    );
  }

  // ── DONE ──
  if (screen === "done") {
    const correct = answers.filter(a => a.correct).length;
    const pctFinal = Math.round((correct / 10) * 100);
    const emoji = pctFinal >= 80 ? "🏆" : pctFinal >= 60 ? "👍" : "📚";
    const msg = pctFinal >= 80 ? "¡Excelente! Eres un experto en paquetes dañados." : pctFinal >= 60 ? "¡Bien hecho! Sigue repasando el proceso." : "Hay oportunidad de mejora. ¡Repasa el flujo!";
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Segoe UI',sans-serif" }}>
        <div style={{ fontSize:64, marginBottom:8 }}>{emoji}</div>
        <h2 style={{ color:"#FFD700", fontSize:24, fontWeight:900, margin:"0 0 4px", textAlign:"center" }}>¡Terminaste, {playerName}!</h2>
        <p style={{ color:"#aaa", fontSize:13, marginBottom:24, textAlign:"center" }}>{msg}</p>
        <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:20, padding:24, width:"100%", maxWidth:360, marginBottom:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, textAlign:"center" }}>
            {[["⭐ Puntos", score], ["✅ Correctas", `${correct}/10`], ["📊 Calificación", `${pctFinal}%`], ["🎯 Nivel", pctFinal>=80?"Experto":pctFinal>=60?"Bueno":"En proceso"]].map(([label, val]) => (
              <div key={label} style={{ background:"rgba(255,255,255,0.06)", borderRadius:12, padding:14 }}>
                <div style={{ color:"#FFD700", fontWeight:900, fontSize:22 }}>{val}</div>
                <div style={{ color:"#aaa", fontSize:11, marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:360 }}>
          <button onClick={() => { setNameInput(playerName); startGame(); }} style={{ padding:"13px", borderRadius:50, background:"linear-gradient(135deg,#FFD700,#FFA500)", color:"#000", fontWeight:900, fontSize:15, border:"none", cursor:"pointer" }}>
            🔄 Jugar de nuevo
          </button>
          <button onClick={() => { fetchLeaderboard(); setScreen("leaderboard"); }} style={{ padding:"13px", borderRadius:50, background:"rgba(255,255,255,0.08)", color:"#fff", fontWeight:700, fontSize:15, border:"2px solid rgba(255,255,255,0.2)", cursor:"pointer" }}>
            🏆 Ver Tabla de Resultados
          </button>
          <button onClick={() => { setNameInput(""); setScreen("home"); }} style={{ padding:"13px", borderRadius:50, background:"transparent", color:"#aaa", fontWeight:600, fontSize:14, border:"2px solid rgba(255,255,255,0.1)", cursor:"pointer" }}>
            🏠 Inicio
          </button>
        </div>
      </div>
    );
  }

  // ── LEADERBOARD ──
  if (screen === "leaderboard") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)", display:"flex", flexDirection:"column", alignItems:"center", padding:24, fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ fontSize:48, marginBottom:4 }}>🏆</div>
      <h2 style={{ color:"#FFD700", fontSize:22, fontWeight:900, margin:"0 0 4px" }}>Tabla de Resultados</h2>
      <p style={{ color:"#aaa", fontSize:12, marginBottom:20 }}>Todos los jugadores que han completado el juego</p>
      {loadingLB ? (
        <p style={{ color:"#aaa" }}>Cargando resultados...</p>
      ) : leaderboard.length === 0 ? (
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:16, padding:24, textAlign:"center", width:"100%", maxWidth:400 }}>
          <p style={{ color:"#aaa", fontSize:14 }}>Aún no hay resultados registrados.</p>
          <p style={{ color:"#666", fontSize:12 }}>¡Sé el primero en jugar!</p>
        </div>
      ) : (
        <div style={{ width:"100%", maxWidth:420 }}>
          {leaderboard.map((entry, i) => (
            <div key={entry.id} style={{ background: i===0 ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.05)", border: i===0 ? "2px solid #FFD700" : "2px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"12px 18px", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:22 }}>{medalEmoji[i] || `${i+1}.`}</span>
                <div style={{ width:36, height:36, borderRadius:"50%", background:COLORS[entry.nombre.charCodeAt(0)%COLORS.length], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:16, color:"#000", flexShrink:0 }}>
                  {entry.nombre[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ color: i===0 ? "#FFD700" : "#fff", fontWeight:700, fontSize:15 }}>{entry.nombre}</div>
                  <div style={{ color:"#666", fontSize:11 }}>{entry.correctas}/10 correctas · {entry.porcentaje}%</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color: i===0 ? "#FFD700" : "#4ECDC4", fontWeight:900, fontSize:20 }}>{entry.puntaje}</div>
                <div style={{ color:"#666", fontSize:11 }}>pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setScreen("home")} style={{ marginTop:20, padding:"12px 32px", borderRadius:50, background:"rgba(255,255,255,0.08)", color:"#aaa", fontWeight:700, fontSize:14, border:"2px solid rgba(255,255,255,0.15)", cursor:"pointer" }}>
        ← Volver al inicio
      </button>
    </div>
  );

  return null;
}
