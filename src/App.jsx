import { useState, useEffect, useRef } from "react";

// ─── DONNÉES ───────────────────────────────────────────────────────────────────

const AGENTS = [
  { id:"content", name:"LYRA", role:"Agent Contenu", icon:"✦", color:"#9B7DC8", accent:"#C4A8E8",
    description:"Création & envoi vers Buffer (Instagram/Facebook)", status:"active", stats:{done:8,pending:5,today:3},
    tasks:["Génère des captions engageantes","Planifie le calendrier éditorial","Envoie vers Buffer automatiquement","Adapte le ton par plateforme","Scripts Reels & Stories"] },
  { id:"growth", name:"NOVA", role:"Agent Croissance", icon:"⬡", color:"#6EAFC9", accent:"#A3D5E8",
    description:"Visibilité & développement d'audience", status:"active", stats:{done:24,pending:7,today:5},
    tasks:["Analyse les hashtags tendance","Identifie les meilleurs horaires","Surveille mentions & partages","Suggère des collaborations","Rapporte les métriques"] },
  { id:"fidelity", name:"SELENE", role:"Agent Fidélisation", icon:"❋", color:"#C96E9B", accent:"#E8A3C4",
    description:"Suivi post-soin & fidélisation client par SMS", status:"active", stats:{done:18,pending:4,today:2},
    tasks:["SMS de suivi 48h après le soin","Messages personnalisés par soin","Offres de retour exclusives","Rappels anniversaires clients","Gestion des avis & témoignages"] },
];

const SOINS = [
  // SOINS ÉNERGÉTIQUES
  { id:"energie_lumiere",  name:"Énergie de lumière", duree:60,  prix:"70€",   couleur:"#C9A96E", desc:"Libération émotionnelle, harmonisation des chakras et reconnexion à ton axe lumineux", categorie:"Soins Énergétiques" },
  { id:"renaissance",      name:"Renaissance",         duree:60,  prix:"88€",   couleur:"#C9A96E", desc:"Un reset intérieur pour tourner la page des anciens schémas et renaître à soi", categorie:"Soins Énergétiques" },
  { id:"vibre_chakras",    name:"Vibre tes chakras",   duree:60,  prix:"77€",   couleur:"#C9A96E", desc:"Activation et alignement des chakras au son des bols tibétains et diapasons", categorie:"Soins Énergétiques" },
  { id:"sensei_soul",      name:"Sensei Soúl",         duree:45,  prix:"88€",   couleur:"#C9A96E", desc:"Faire le deuil et se délester des mémoires passées, avec ambre et aimants gravés", categorie:"Soins Énergétiques" },
  { id:"lahochi",          name:"Lahochi",              duree:30,  prix:"50€",   couleur:"#C9A96E", desc:"Canalisation d'énergie par apposition des mains. Détente profonde, apaisement du stress", categorie:"Soins Énergétiques" },
  // MASSAGES MAGNÉTIQUES
  { id:"bye_bye_c",        name:"Bye Bye C",            duree:45,  prix:"70€",   couleur:"#9B7DC8", desc:"Massage magnétique libérateur de cellulite. La silhouette se redessine, les jambes s'allègent", categorie:"Massages Magnétiques" },
  { id:"koharu",           name:"Koharu",               duree:45,  prix:"70€",   couleur:"#9B7DC8", desc:"Rituel magnétique du visage. Les traits se détendent, l'éclat naturel se révèle", categorie:"Massages Magnétiques" },
  { id:"lymphflow",        name:"Lymphflow",            duree:60,  prix:"120€",  couleur:"#9B7DC8", desc:"Drainage énergétique intuitif. Jambes plus légères, ventre dégonflé, immunité renforcée", categorie:"Massages Magnétiques" },
  { id:"the_body",         name:"The Body",             duree:120, prix:"140€",  couleur:"#9B7DC8", desc:"Massage immersif : gestes manuels, baguettes Kansa, huiles et énergie vibratoire", categorie:"Massages Magnétiques" },
  // RITUELS
  { id:"voyage_sens",      name:"Voyage des sens",      duree:60,  prix:"77€",   couleur:"#6EAFC9", desc:"Bain de pieds parfumé, méditation, pierres de lumière, réflexologie et massage enveloppant, scellé par un enveloppement chaud", categorie:"Rituels" },
  { id:"hanashi",          name:"Le Rituel Hanashi",    duree:120, prix:"150€",  couleur:"#6EAFC9", desc:"Cérémonie immersive en 5 zones continues, avec Head spa : Kobido crânien et facial, mains, réflexologie plantaire et instruments sacrés", categorie:"Rituels" },
  // PROGRAMMES
  { id:"divine_body_flow", name:"Divine Body Flow",     duree:0,   prix:"1111€", couleur:"#C96E9B", desc:"Programme holistique incluant KeyLight : soins drainants, massage anti-cellulite, hypno-méditation et activation du féminin sacré. Programme 5 semaines", categorie:"Programmes" },
  { id:"keylight",         name:"KeyLight",             duree:60,  prix:"222€",  couleur:"#C96E9B", desc:"Activation vibratoire de la satiété intérieure : un code de lumière posé dans les corps subtils. Rendez-vous visio", categorie:"Programmes" },
];

const HORAIRES_DISPO = ["09:00","10:30","12:00","14:00","15:30","17:00","18:30"];

const JOURS_SEMAINE = ["Lun","Mar","Mer","Jeu","Ven","Sam"];

function getDates() {
  const today = new Date();
  return Array.from({length:14}, (_,i) => {
    const d = new Date(today); d.setDate(today.getDate() + i);
    return { date: d, label: d.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"}),
      isToday: i===0, jour: d.toLocaleDateString("fr-FR",{weekday:"short"}).slice(0,3) };
  }).filter(d => !["dim","sam"].includes(d.jour.toLowerCase()) || d.jour === "sam");
}

const PENDING_CONTENT_INIT = [
  { id:1, agent:"LYRA", platform:"Instagram", type:"Post", color:"#9B7DC8",
    time:"Aujourd'hui 18h30",
    preview:"✨ Le silence a ses propres fréquences. Quand les mains savent écouter le corps, chaque tension raconte une histoire. ZÉNITH, c'est l'art d'entendre ce que les mots ne peuvent pas dire. 🌿\n\n#soincervical #bienêtre #thérapiemyofasciale #zenith" },
  { id:2, agent:"LYRA", platform:"Facebook", type:"Post", color:"#9B7DC8",
    time:"Demain 10h00",
    preview:"Parce que votre nuque porte (littéralement) le poids du monde...\n\nLe soin ZÉNITH a été pensé pour elle. 90 minutes pour relâcher ce que vous portez depuis trop longtemps. Places limitées — lien en bio 🔗" },
  { id:3, agent:"NOVA", platform:"Instagram", type:"Conseil", color:"#6EAFC9",
    time:"Ce soir 19h00",
    preview:"📊 Ton audience est 3x plus active entre 19h-21h. Je recommande de poster COCON ce soir. Gain estimé : +40% de reach. Hashtags optimaux : #soindubienetre #cocon #hammock" },
  { id:4, agent:"SELENE", platform:"SMS", type:"Message", color:"#C96E9B",
    time:"Lundi 09h00",
    preview:"Bonjour 💫 Votre soin avec Géraldine Esther date d'il y a 3 semaines. Votre corps vous réclame peut-être un peu d'attention ? Je vous ai réservé un créneau privilégié..." },
];

const ACTIVITY_LOG_INIT = [
  { time:"13:18", agent:"NOVA",   msg:"Pic d'engagement détecté sur #soinvisage (+28%)", type:"info"    },
  { time:"12:05", agent:"LYRA",   msg:"Post COCON envoyé vers Buffer — file d'attente",  type:"pending" },
  { time:"11:40", agent:"SELENE", msg:"SMS suivi post-soin envoyé à Marine D. (ZÉNITH)", type:"success" },
  { time:"10:30", agent:"SELENE", msg:"3 clientes relancées automatiquement",             type:"success" },
  { time:"09:30", agent:"NOVA",   msg:"Rapport hebdo prêt — +18% de followers",          type:"success" },
  { time:"09:00", agent:"LYRA",   msg:"Calendrier éditorial de la semaine généré",        type:"info"    },
];

// ─── COMPOSANTS UTILITAIRES ───────────────────────────────────────────────────

function PulsingDot({ color, active }) {
  return (
    <span style={{position:"relative",display:"inline-block",width:10,height:10}}>
      <span style={{display:"block",width:10,height:10,borderRadius:"50%",background:active?color:"#444",boxShadow:active?`0 0 8px ${color}`:"none"}}/>
      {active && <span style={{position:"absolute",top:0,left:0,width:10,height:10,borderRadius:"50%",background:color,opacity:0.4,animation:"ping 1.5s ease-in-out infinite"}}/>}
    </span>
  );
}

function Badge({ label, color }) {
  return <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,background:color+"22",color,letterSpacing:1}}>{label}</span>;
}

function AgentCard({ agent, isSelected, onClick }) {
  const statusLabel = {active:"Actif",waiting:"En veille",idle:"Inactif"};
  return (
    <div onClick={onClick} style={{
      background:isSelected?"linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))":"rgba(255,255,255,0.02)",
      border:`1px solid ${isSelected?agent.color+"88":"rgba(255,255,255,0.07)"}`,
      borderRadius:16,padding:"20px 18px",cursor:"pointer",transition:"all 0.3s ease",position:"relative",overflow:"hidden",
    }}>
      {isSelected && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${agent.color},transparent)`}}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <span style={{fontSize:28,color:agent.color,filter:`drop-shadow(0 0 6px ${agent.color}88)`}}>{agent.icon}</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <PulsingDot color={agent.color} active={agent.status==="active"}/>
          <span style={{fontSize:11,color:agent.status==="active"?agent.color:"#666",fontFamily:"monospace"}}>{statusLabel[agent.status]}</span>
        </div>
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:agent.accent,letterSpacing:2,marginBottom:4}}>{agent.name}</div>
      <div style={{fontSize:11,color:"#888",marginBottom:14,letterSpacing:1}}>{agent.role.toUpperCase()}</div>
      <div style={{display:"flex",gap:10}}>
        {[{l:"Faits",v:agent.stats.done,c:"#4CAF8A"},{l:"En cours",v:agent.stats.pending,c:agent.color},{l:"Auj.",v:agent.stats.today,c:agent.accent}].map(s=>(
          <div key={s.l} style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:700,color:s.c,fontFamily:"monospace"}}>{s.v}</div>
            <div style={{fontSize:9,color:"#555",letterSpacing:0.5}}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ONGLET BOOKING ───────────────────────────────────────────────────────────

// ─── SMS BREVO ────────────────────────────────────────────────────────────────

async function envoyerSmsBrevo({ apiKey, tel, message }) {
  try {
    const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: "GeraldineE",
        recipient: tel.replace(/\s/g,"").replace(/^0/,"+33"),
        content: message,
        type: "transactional",
      }),
    });
    return res.ok ? { ok: true } : { ok: false, err: await res.text() };
  } catch(e) { return { ok: false, err: e.message }; }
}

function msAvantRappel(dateLabel, heure) {
  // Calcule les ms jusqu'à 24h avant le RDV (pour le timer de rappel)
  const moisFr = {"janv":0,"févr":1,"mars":2,"avr":3,"mai":4,"juin":5,"juil":6,"août":7,"sept":8,"oct":9,"nov":10,"déc":11};
  try {
    const parts = dateLabel.split(" "); // ex: "Ven. 13 juin"
    const jour = parseInt(parts[1]);
    const mois = moisFr[parts[2]?.toLowerCase().replace(".","")];
    const annee = new Date().getFullYear();
    const [h, m] = heure.split(":").map(Number);
    const rdvDate = new Date(annee, mois, jour, h, m, 0);
    const rappelDate = new Date(rdvDate.getTime() - 24*60*60*1000); // -24h
    return rappelDate.getTime() - Date.now();
  } catch { return -1; }
}

// ─── ONGLET BOOKING ───────────────────────────────────────────────────────────

function BookingTab({ onLog }) {
  const [step, setStep] = useState(1);
  const [soin, setSoin] = useState(null);
  const [dateChoisie, setDateChoisie] = useState(null);
  const [heure, setHeure] = useState(null);
  const [client, setClient] = useState({nom:"",prenom:"",tel:"",email:""});
  const [rdvList, setRdvList] = useState([
    {id:1,prenom:"Marine",nom:"D.",soin:"ZÉNITH",date:"Vendredi 13 juin",heure:"10:00",status:"confirmé",tel:"06••••••12",rappelProg:false},
    {id:2,prenom:"Sophie",nom:"M.",soin:"COCON", date:"Mardi 17 juin",  heure:"14:00",status:"confirmé",tel:"06••••••88",rappelProg:false},
    {id:3,prenom:"Clara", nom:"R.",soin:"BALIZÉ",date:"Jeudi 19 juin",  heure:"15:30",status:"en attente",tel:"06••••••44",rappelProg:false},
  ]);
  const [blockedSlots] = useState({"2":["09:00","10:30"],"5":["14:00"]});
  const [brevoKey, setBrevoKey] = useState("");
  const [brevoConnected, setBrevoConnected] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState(null);
  const [showBrevoSetup, setShowBrevoSetup] = useState(false);
  const [rappelsActifs, setRappelsActifs] = useState([]);
  const [suiviActifs, setSuiviActifs] = useState([]); // suivis post-soin SELENE
  const timersRef = useRef({});
  const dates = getDates();

  // Nettoyage des timers au démontage
  useEffect(() => {
    return () => Object.values(timersRef.current).forEach(clearTimeout);
  }, []);

  const programmerRappel = (rdv, apiKey) => {
    const delai = msAvantRappel(rdv.date, rdv.heure);
    if (delai <= 0) return; // RDV dans moins de 24h → pas de rappel futur

    const infoRappel = {
      id: rdv.id,
      prenom: rdv.prenom,
      soin: rdv.soin,
      date: rdv.date,
      heure: rdv.heure,
      envoiPrévu: new Date(Date.now() + delai).toLocaleString("fr-FR"),
    };
    setRappelsActifs(r => [...r.filter(x=>x.id!==rdv.id), infoRappel]);

    timersRef.current[rdv.id] = setTimeout(async () => {
      const msg = `🌿 Rappel — Bonjour ${rdv.prenom} ! Votre soin ${rdv.soin} est demain à ${rdv.heure}. Besoin d'annuler ? Prévenez-nous dès maintenant. À demain ! — Géraldine Esther ✨`;
      const result = await envoyerSmsBrevo({ apiKey, tel: rdv.tel, message: msg });
      onLog({
        time: new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
        agent: "ARIA",
        msg: result.ok
          ? `📱 SMS rappel 24h envoyé à ${rdv.prenom} pour ${rdv.soin}`
          : `⚠ Rappel SMS échoué — ${rdv.prenom}`,
        type: result.ok ? "success" : "warning",
      });
      setRdvList(r => r.map(x => x.id===rdv.id ? {...x, rappelEnvoye:true} : x));
      setRappelsActifs(r => r.filter(x=>x.id!==rdv.id));
    }, delai);
  };

  const programmerSuiviSelene = (rdv, apiKey) => {
    // Calcule ms jusqu'à 48h après l'heure du RDV
    const moisFr = {"janv":0,"févr":1,"mars":2,"avr":3,"mai":4,"juin":5,"juil":6,"août":7,"sept":8,"oct":9,"nov":10,"déc":11};
    let delai = -1;
    try {
      const parts = rdv.date.split(" ");
      const jour = parseInt(parts[1]);
      const mois = moisFr[parts[2]?.toLowerCase().replace(".","")];
      const [h, m] = rdv.heure.split(":").map(Number);
      const rdvDate = new Date(new Date().getFullYear(), mois, jour, h, m, 0);
      const suiviDate = new Date(rdvDate.getTime() + 48*60*60*1000); // +48h
      delai = suiviDate.getTime() - Date.now();
    } catch {}
    if (delai <= 0) return;

    const envoiPrévu = new Date(Date.now() + delai).toLocaleString("fr-FR");
    setSuiviActifs(s => [...s.filter(x=>x.id!==rdv.id), { id:rdv.id, prenom:rdv.prenom, soin:rdv.soin, envoiPrévu }]);

    timersRef.current[`suivi_${rdv.id}`] = setTimeout(async () => {
      const messages = {
        "ZÉNITH": `🌿 Bonjour ${rdv.prenom} ! Comment se porte votre nuque depuis votre soin ZÉNITH ? J'espère que vous sentez la légèreté 🌸 N'hésitez pas à me faire un retour — et si votre corps réclame une nouvelle séance, je suis là ! — Géraldine Esther ✨`,
        "COCON":  `🌿 Bonjour ${rdv.prenom} ! J'espère que vous portez encore en vous cette douceur du soin COCON 🪶 Votre corps vous dit merci. Si vous souhaitez replonger dans cette bulle... je vous attends — Géraldine Esther ✨`,
        "BALIZÉ": `🌿 Bonjour ${rdv.prenom} ! Deux jours après BALIZÉ — est-ce que la chaleur des pierres vous manque déjà ? 🌋 Votre peau et vos muscles vous remercient. On remet ça bientôt ? — Géraldine Esther ✨`,
      };
      const msg = messages[rdv.soin] || `🌿 Bonjour ${rdv.prenom} ! Comment vous sentez-vous après votre soin ? J'espère que vous allez bien — Géraldine Esther ✨`;
      const result = await envoyerSmsBrevo({ apiKey, tel: rdv.tel, message: msg });
      onLog({
        time: new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
        agent: "SELENE",
        msg: result.ok
          ? `❋ SMS suivi post-soin envoyé à ${rdv.prenom} (${rdv.soin})`
          : `⚠ SMS suivi SELENE échoué — ${rdv.prenom}`,
        type: result.ok ? "success" : "warning",
      });
      setRdvList(r => r.map(x => x.id===rdv.id ? {...x, suiviEnvoye:true} : x));
      setSuiviActifs(s => s.filter(x=>x.id!==rdv.id));
    }, delai);
  };

  const handleConfirm = async () => {
    const newRdv = {
      id: Date.now(), prenom:client.prenom, nom:client.nom,
      soin: soin.name, date: dateChoisie.label, heure,
      status:"confirmé", tel:client.tel, rappelProg:false,
      dateObj: dateChoisie.date,
    };
    setRdvList(r=>[newRdv,...r]);
    onLog({time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}), agent:"ARIA",
      msg:`RDV confirmé — ${client.prenom} ${client.nom} — ${soin.name} — ${dateChoisie.label} ${heure}`, type:"success"});

    if (brevoConnected && client.tel) {
      setSmsSending(true);
      // 1. SMS de confirmation immédiat
      const msgConfirm = `✨ Bonjour ${client.prenom} ! Votre soin ${soin.name} est confirmé le ${dateChoisie.label} à ${heure}. En cas d'empêchement, merci de prévenir 24h à l'avance. À très vite — Géraldine Esther 🌿`;
      const result = await envoyerSmsBrevo({ apiKey: brevoKey, tel: client.tel, message: msgConfirm });
      setSmsResult(result);
      setSmsSending(false);
      onLog({time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}), agent:"ARIA",
        msg: result.ok ? `📱 SMS confirmation envoyé à ${client.prenom}` : `⚠ SMS confirmation échoué`,
        type: result.ok ? "success" : "warning"});

      // 2. Programmer le rappel 24h avant
      const delai = msAvantRappel(dateChoisie.label, heure);
      if (delai > 0) {
        programmerRappel({...newRdv}, brevoKey);
        onLog({time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}), agent:"ARIA",
          msg:`⏰ Rappel SMS programmé 24h avant pour ${client.prenom} — ${dateChoisie.label} à ${heure}`,
          type:"info"});
      }

      // 3. Programmer le suivi SELENE 48h après le soin
      programmerSuiviSelene({...newRdv}, brevoKey);
      onLog({time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}), agent:"SELENE",
        msg:`❋ Suivi post-soin programmé 48h après pour ${client.prenom} — ${soin.name}`,
        type:"info"});
    }
    setStep(5);
  };

  const reset = () => { setStep(1);setSoin(null);setDateChoisie(null);setHeure(null);setClient({nom:"",prenom:"",tel:"",email:""});setSmsResult(null); };

  return (
    <div style={{animation:"fadeIn 0.4s ease"}}>

      {/* Bloc Brevo SMS */}
      <div style={{background:`rgba(201,169,110,${brevoConnected?0.04:0.02})`,
        border:`1px solid ${brevoConnected?"rgba(76,175,138,0.3)":"rgba(201,169,110,0.2)"}`,
        borderRadius:14,padding:"14px 18px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>📱</span>
            <div>
              <div style={{fontSize:13,color:brevoConnected?"#4CAF8A":"#C9A96E",fontFamily:"'Cinzel',serif",letterSpacing:1}}>
                SMS Brevo {brevoConnected?"— Connecté ✓":"— Non connecté"}
              </div>
              <div style={{fontSize:11,color:"#666",marginTop:2}}>
                {brevoConnected?"ARIA enverra un SMS de confirmation automatiquement à chaque RDV.":"Active les SMS automatiques pour tes clients."}
              </div>
            </div>
          </div>
          <button onClick={()=>setShowBrevoSetup(!showBrevoSetup)} style={{
            padding:"7px 14px",borderRadius:10,border:`1px solid ${brevoConnected?"rgba(76,175,138,0.3)":"rgba(201,169,110,0.3)"}`,
            background:"transparent",color:brevoConnected?"#4CAF8A":"#C9A96E",fontSize:12,cursor:"pointer"}}>
            {brevoConnected?"Modifier":"Configurer"}
          </button>
        </div>

        {showBrevoSetup && (
          <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            {!brevoConnected && (
              <div style={{background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
                <div style={{fontSize:11,color:"#C9A96E",marginBottom:8,letterSpacing:1}}>📋 OBTENIR TA CLÉ BREVO (2 min)</div>
                {["1. Va sur brevo.com → crée un compte gratuit","2. Paramètres → Clés API → Générer une clé","3. Active le module SMS Transactionnel","4. Colle ta clé ici → ARIA envoie les SMS !"].map((s,i)=>(
                  <div key={i} style={{fontSize:11,color:"#666",marginBottom:5,display:"flex",gap:8}}>
                    <span style={{color:"#C9A96E"}}>▸</span>{s}
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <input value={brevoKey} onChange={e=>setBrevoKey(e.target.value)}
                placeholder="Clé API Brevo (xkeysib-...)"
                style={{flex:1,padding:"9px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.1)",color:"#E8E0D4",fontSize:12,outline:"none"}}/>
              <button onClick={()=>{if(brevoKey.length>10){setBrevoConnected(true);setShowBrevoSetup(false);}}} style={{
                padding:"9px 18px",borderRadius:10,border:"none",
                background:"linear-gradient(135deg,#C9A96E,#A07840)",
                color:"#0A0A0C",fontSize:12,cursor:"pointer",fontWeight:600}}>
                Activer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste RDV existants */}
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:15,color:"#C9A96E",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>◈ Planning ARIA</span>
          <button onClick={reset} style={{padding:"7px 18px",borderRadius:10,border:"1px solid #C9A96E44",background:"rgba(201,169,110,0.1)",color:"#C9A96E",fontSize:12,cursor:"pointer"}}>
            + Nouveau RDV
          </button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {rdvList.map(r=>{
            const rappel = rappelsActifs.find(x=>x.id===r.id);
            return (
            <div key={r.id} style={{borderRadius:12,overflow:"hidden",
              border:`1px solid ${r.status==="confirmé"?"rgba(76,175,138,0.25)":"rgba(201,169,110,0.25)"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",
                background:"rgba(255,255,255,0.025)"}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(201,169,110,0.12)",display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'Cinzel',serif",color:"#C9A96E",fontSize:14,fontWeight:600}}>{r.prenom[0]}{r.nom[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:"#E8E0D4",fontWeight:500}}>{r.prenom} {r.nom}</div>
                  <div style={{fontSize:11,color:"#777",marginTop:2}}>{r.soin} · {r.date} à {r.heure}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,
                    background:r.status==="confirmé"?"rgba(76,175,138,0.15)":"rgba(201,169,110,0.15)",
                    color:r.status==="confirmé"?"#4CAF8A":"#C9A96E"}}>{r.status}</span>
                  {r.rappelEnvoye && <span style={{fontSize:10,color:"#4CAF8A"}}>📱 Rappel envoyé</span>}
                </div>
              </div>
              {/* Bandeau rappel programmé */}
              {rappel && (
                <div style={{padding:"7px 16px",background:"rgba(110,175,201,0.08)",borderTop:"1px solid rgba(110,175,201,0.15)",
                  display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11}}>⏰</span>
                  <span style={{fontSize:11,color:"#6EAFC9"}}>Rappel SMS programmé — envoi le {rappel.envoiPrévu}</span>
                </div>
              )}
              {/* Bandeau suivi SELENE */}
              {suiviActifs.find(x=>x.id===r.id) && (
                <div style={{padding:"7px 16px",background:"rgba(201,110,155,0.08)",borderTop:"1px solid rgba(201,110,155,0.15)",
                  display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11}}>❋</span>
                  <span style={{fontSize:11,color:"#C96E9B"}}>Suivi SELENE programmé — envoi le {suiviActifs.find(x=>x.id===r.id)?.envoiPrévu}</span>
                </div>
              )}
              {r.suiviEnvoye && (
                <div style={{padding:"7px 16px",background:"rgba(201,110,155,0.06)",borderTop:"1px solid rgba(201,110,155,0.1)",
                  display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11}}>❋</span>
                  <span style={{fontSize:11,color:"#C96E9B"}}>Suivi post-soin envoyé par SELENE ✓</span>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Formulaire nouveau RDV */}
      <div style={{background:"rgba(201,169,110,0.04)",border:"1px solid rgba(201,169,110,0.15)",borderRadius:16,padding:24}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"#C9A96E",marginBottom:20,letterSpacing:2}}>
          NOUVEAU RENDEZ-VOUS — ÉTAPE {step}/4
        </div>

        {/* Progress */}
        <div style={{display:"flex",gap:6,marginBottom:24}}>
          {["Soin","Date","Heure","Client"].map((s,i)=>(
            <div key={s} style={{flex:1,height:3,borderRadius:2,background:step>i?"#C9A96E":"rgba(255,255,255,0.08)",transition:"background 0.3s"}}/>
          ))}
        </div>

        {step===1 && (
          <div>
            <div style={{fontSize:13,color:"#888",marginBottom:16}}>Quel soin ?</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
              {SOINS.map(s=>(
                <div key={s.id} onClick={()=>{setSoin(s);setStep(2);}} style={{
                  padding:"18px 16px",borderRadius:14,border:`1px solid ${s.couleur}44`,
                  background:`rgba(0,0,0,0.2)`,cursor:"pointer",transition:"all 0.2s",
                  ":hover":{borderColor:s.couleur},
                }}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:16,color:s.couleur,letterSpacing:2,marginBottom:6}}>{s.name}</div>
                  <div style={{fontSize:11,color:"#777",marginBottom:8}}>{s.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,color:"#555"}}>{s.duree} min</span>
                    <span style={{fontSize:13,color:s.couleur,fontWeight:600}}>{s.prix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step===2 && (
          <div>
            <div style={{fontSize:13,color:"#888",marginBottom:16}}>Quelle date ? <span style={{color:soin?.couleur}}>{soin?.name}</span></div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {dates.map((d,i)=>(
                <div key={i} onClick={()=>{setDateChoisie(d);setStep(3);}} style={{
                  padding:"10px 14px",borderRadius:12,cursor:"pointer",
                  background:d.isToday?"rgba(201,169,110,0.12)":"rgba(255,255,255,0.03)",
                  border:`1px solid ${d.isToday?"#C9A96E44":"rgba(255,255,255,0.07)"}`,
                  textAlign:"center",minWidth:72,
                }}>
                  <div style={{fontSize:10,color:"#666",marginBottom:3}}>{d.label.split(" ")[0].toUpperCase()}</div>
                  <div style={{fontSize:18,color:"#E8E0D4",fontWeight:600}}>{d.date.getDate()}</div>
                  <div style={{fontSize:10,color:"#555"}}>{d.label.split(" ")[2]}</div>
                  {d.isToday && <div style={{fontSize:9,color:"#C9A96E",marginTop:3}}>AUJ.</div>}
                </div>
              ))}
            </div>
            <button onClick={()=>setStep(1)} style={{marginTop:16,padding:"8px 16px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#666",fontSize:12,cursor:"pointer"}}>← Retour</button>
          </div>
        )}

        {step===3 && (
          <div>
            <div style={{fontSize:13,color:"#888",marginBottom:16}}>Quel créneau ? <span style={{color:"#C9A96E"}}>{dateChoisie?.label}</span></div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {HORAIRES_DISPO.map(h=>{
                const blocked = blockedSlots[String(dateChoisie?.date.getDay())]?.includes(h);
                return (
                  <div key={h} onClick={()=>{if(!blocked){setHeure(h);setStep(4);}}} style={{
                    padding:"12px 20px",borderRadius:12,cursor:blocked?"not-allowed":"pointer",
                    background:blocked?"rgba(255,255,255,0.02)":"rgba(201,169,110,0.08)",
                    border:`1px solid ${blocked?"rgba(255,255,255,0.05)":"#C9A96E33"}`,
                    color:blocked?"#444":"#C9A96E",fontSize:14,fontFamily:"monospace",
                    opacity:blocked?0.4:1,
                  }}>
                    {h}
                    {blocked && <div style={{fontSize:9,color:"#555",marginTop:2}}>Occupé</div>}
                  </div>
                );
              })}
            </div>
            <button onClick={()=>setStep(2)} style={{marginTop:16,padding:"8px 16px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#666",fontSize:12,cursor:"pointer"}}>← Retour</button>
          </div>
        )}

        {step===4 && (
          <div>
            <div style={{fontSize:13,color:"#888",marginBottom:16}}>Infos client</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              {[{k:"prenom",l:"Prénom"},{k:"nom",l:"Nom"},{k:"tel",l:"Téléphone"},{k:"email",l:"Email"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:11,color:"#666",marginBottom:6,letterSpacing:1}}>{f.l.toUpperCase()}</div>
                  <input value={client[f.k]} onChange={e=>setClient(c=>({...c,[f.k]:e.target.value}))}
                    style={{width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",
                      border:"1px solid rgba(255,255,255,0.1)",color:"#E8E0D4",fontSize:13,outline:"none"}}/>
                </div>
              ))}
            </div>
            <div style={{padding:"14px 16px",borderRadius:12,background:"rgba(201,169,110,0.06)",border:"1px solid rgba(201,169,110,0.15)",marginBottom:16}}>
              <div style={{fontSize:12,color:"#888",marginBottom:8}}>Récapitulatif</div>
              <div style={{fontSize:13,color:"#E8E0D4"}}>🌿 <strong style={{color:soin?.couleur}}>{soin?.name}</strong> · {dateChoisie?.label} à {heure} · {soin?.prix}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(3)} style={{padding:"10px 20px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#666",fontSize:13,cursor:"pointer"}}>← Retour</button>
              <button onClick={handleConfirm} disabled={!client.prenom||!client.tel} style={{flex:1,padding:"12px",borderRadius:10,border:"none",
                background:(!client.prenom||!client.tel)?"#333":"linear-gradient(135deg,#C9A96E,#A07840)",
                color:(!client.prenom||!client.tel)?"#666":"#0A0A0C",fontSize:13,cursor:(!client.prenom||!client.tel)?"not-allowed":"pointer",fontWeight:600}}>
                ◈ Confirmer le RDV
              </button>
            </div>
          </div>
        )}

        {step===5 && (
          <div style={{textAlign:"center",padding:"28px 0"}}>
            <div style={{fontSize:44,marginBottom:14,animation:"float 2s ease-in-out infinite"}}>◈</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:"#4CAF8A",marginBottom:8}}>RDV Confirmé !</div>
            <div style={{fontSize:13,color:"#888",marginBottom:16}}>
              {client.prenom} {client.nom} — {soin?.name} — {dateChoisie?.label} à {heure}
            </div>

            {brevoConnected ? (
              <div style={{display:"flex",flexDirection:"column",gap:8,margin:"0 auto 20px",maxWidth:340}}>

                {/* 1. SMS confirmation immédiat */}
                <div style={{padding:"11px 16px",borderRadius:12,
                  background:smsSending?"rgba(201,169,110,0.08)":smsResult?.ok?"rgba(76,175,138,0.08)":"rgba(255,100,100,0.08)",
                  border:`1px solid ${smsSending?"rgba(201,169,110,0.25)":smsResult?.ok?"rgba(76,175,138,0.25)":"rgba(255,100,100,0.25)"}`,
                  display:"flex",alignItems:"center",gap:10}}>
                  <span>📱</span>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:12,fontWeight:500,
                      color:smsSending?"#C9A96E":smsResult?.ok?"#4CAF8A":"#ff8888"}}>
                      {smsSending?"Envoi en cours...":smsResult?.ok?"SMS confirmation envoyé ✓":"SMS non envoyé ⚠"}
                    </div>
                    <div style={{fontSize:11,color:"#666",marginTop:2}}>Confirmation immédiate — ARIA</div>
                  </div>
                </div>

                {/* 2. Rappel ARIA 24h avant */}
                {msAvantRappel(dateChoisie?.label||"", heure||"") > 0 ? (
                  <div style={{padding:"11px 16px",borderRadius:12,
                    background:"rgba(110,175,201,0.08)",border:"1px solid rgba(110,175,201,0.25)",
                    display:"flex",alignItems:"center",gap:10}}>
                    <span>⏰</span>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:12,color:"#6EAFC9",fontWeight:500}}>Rappel SMS programmé ✓</div>
                      <div style={{fontSize:11,color:"#666",marginTop:2}}>24h avant le RDV — ARIA</div>
                    </div>
                  </div>
                ) : (
                  <div style={{padding:"11px 16px",borderRadius:12,
                    background:"rgba(255,160,60,0.08)",border:"1px solid rgba(255,160,60,0.2)",
                    display:"flex",alignItems:"center",gap:10}}>
                    <span>⚡</span>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:12,color:"#E8A060"}}>RDV dans moins de 24h</div>
                      <div style={{fontSize:11,color:"#666",marginTop:2}}>Pas de rappel — déjà imminent !</div>
                    </div>
                  </div>
                )}

                {/* 3. Suivi SELENE 48h après */}
                <div style={{padding:"11px 16px",borderRadius:12,
                  background:"rgba(201,110,155,0.08)",border:"1px solid rgba(201,110,155,0.25)",
                  display:"flex",alignItems:"center",gap:10}}>
                  <span>❋</span>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:12,color:"#C96E9B",fontWeight:500}}>Suivi post-soin programmé ✓</div>
                    <div style={{fontSize:11,color:"#666",marginTop:2}}>Message personnalisé 48h après — SELENE</div>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{fontSize:12,color:"#666",marginBottom:20}}>
                💡 Configure Brevo pour activer les 3 SMS automatiques
              </div>
            )}

            <button onClick={reset} style={{padding:"10px 28px",borderRadius:12,border:"1px solid #C9A96E44",
              background:"rgba(201,169,110,0.1)",color:"#C9A96E",fontSize:13,cursor:"pointer"}}>
              Nouveau RDV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ONGLET BUFFER / CONTENU ──────────────────────────────────────────────────

function BufferTab({ pendingContent, setPendingContent, validated, setValidated, onLog }) {
  const [bufferToken, setBufferToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genSoin, setGenSoin] = useState("hanashi");
  const [genPlatform, setGenPlatform] = useState("Instagram");
  const [genType, setGenType] = useState("Post");
  const [expanded, setExpanded] = useState(null);

  const connectBuffer = () => {
    if (bufferToken.length > 5) { setIsConnected(true); }
  };

  const generateContent = async () => {
    setGenerating(true);
    const soinObj = SOINS.find(s=>s.id===genSoin);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`Tu es LYRA, agent de contenu pour Géraldine Esther, thérapeute myofasciale en Seine-et-Marne. 
Ton rôle : rédiger des posts ${genPlatform} pour ses soins signature.
Ton ton : professionnel, spirituel, énergétique, avec une légère touche d'humour bienveillant.
Tu écris en français. Pas de hashtags génériques, seulement des hashtags en lien direct avec le soin.
Réponds UNIQUEMENT avec le texte du post, rien d'autre.`,
          messages:[{role:"user",content:`Rédige un ${genType} ${genPlatform} pour le soin ${soinObj.name} (${soinObj.desc}, ${soinObj.duree} min, ${soinObj.prix}). Sois créatif, inspirant et authentique.`}]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b=>b.type==="text")?.text || "";
      const newItem = {
        id:Date.now(), agent:"LYRA", platform:genPlatform, type:genType,
        color:"#9B7DC8", time:"À planifier", preview:text, soin:soinObj.name,
      };
      setPendingContent(c=>[newItem,...c]);
      onLog({time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
        agent:"LYRA", msg:`${genType} ${genPlatform} pour ${soinObj.name} généré — en attente de validation`, type:"pending"});
    } catch(e) {}
    setGenerating(false);
  };

  const handleValidate = (id) => {
    const item = pendingContent.find(c=>c.id===id);
    setValidated(v=>[{...item,validatedAt:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})},...v]);
    setPendingContent(c=>c.filter(x=>x.id!==id));
    onLog({time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
      agent:"LYRA", msg:`Post ${item.platform} validé → envoyé à Buffer`, type:"success"});
  };

  const handleReject = (id) => {
    setPendingContent(c=>c.filter(x=>x.id!==id));
  };

  return (
    <div style={{animation:"fadeIn 0.4s ease"}}>

      {/* Connexion Buffer */}
      <div style={{background:"rgba(155,125,200,0.06)",border:`1px solid ${isConnected?"rgba(76,175,138,0.3)":"rgba(155,125,200,0.2)"}`,
        borderRadius:16,padding:"18px 22px",marginBottom:24,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:22}}>✦</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:isConnected?"#4CAF8A":"#9B7DC8",letterSpacing:1,marginBottom:4}}>
            Buffer {isConnected?"— Connecté ✓":"— Non connecté"}
          </div>
          <div style={{fontSize:12,color:"#666"}}>
            {isConnected?"LYRA enverra tes posts directement dans ta file Buffer.":"Entre ton Access Token Buffer pour activer la publication automatique."}
          </div>
        </div>
        {!isConnected ? (
          <div style={{display:"flex",gap:8}}>
            <input value={bufferToken} onChange={e=>setBufferToken(e.target.value)}
              placeholder="Access Token Buffer..."
              style={{padding:"9px 14px",borderRadius:10,background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(155,125,200,0.3)",color:"#E8E0D4",fontSize:12,outline:"none",width:200}}/>
            <button onClick={connectBuffer} style={{padding:"9px 18px",borderRadius:10,border:"none",
              background:"linear-gradient(135deg,#9B7DC8,#7B5DA8)",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600}}>
              Connecter
            </button>
          </div>
        ) : (
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#4CAF8A",boxShadow:"0 0 8px #4CAF8A"}}/>
            <span style={{fontSize:12,color:"#4CAF8A"}}>Prêt à publier</span>
          </div>
        )}
      </div>

      {/* Guide Buffer si non connecté */}
      {!isConnected && (
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"16px 20px",marginBottom:24}}>
          <div style={{fontSize:12,color:"#C9A96E",marginBottom:10,letterSpacing:1}}>📋 COMMENT OBTENIR TON TOKEN BUFFER</div>
          {["1. Va sur buffer.com → Connexion avec Instagram Business","2. Paramètres → Accès développeur → Créer un token","3. Copie le token et colle-le ici","4. LYRA pourra publier automatiquement !"].map((s,i)=>(
            <div key={i} style={{fontSize:12,color:"#777",marginBottom:6,display:"flex",gap:10}}>
              <span style={{color:"#9B7DC8"}}>▸</span>{s}
            </div>
          ))}
        </div>
      )}

      {/* Générateur de contenu */}
      <div style={{background:"rgba(155,125,200,0.04)",border:"1px solid rgba(155,125,200,0.15)",borderRadius:16,padding:20,marginBottom:24}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"#9B7DC8",marginBottom:16,letterSpacing:1}}>✦ LYRA — GÉNÉRER UN CONTENU</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
          <div style={{flex:1,minWidth:140}}>
            <div style={{fontSize:11,color:"#666",marginBottom:6}}>SOIN</div>
            <select value={genSoin} onChange={e=>setGenSoin(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:10,
              background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#E8E0D4",fontSize:13,outline:"none"}}>
              <optgroup label="— Rituels" style={{background:"#1a1a1e"}}>
                {SOINS.filter(s=>s.categorie==="Rituels").map(s=><option key={s.id} value={s.id} style={{background:"#1a1a1e"}}>{s.name}</option>)}
              </optgroup>
              <optgroup label="— Soins Énergétiques" style={{background:"#1a1a1e"}}>
                {SOINS.filter(s=>s.categorie==="Soins Énergétiques").map(s=><option key={s.id} value={s.id} style={{background:"#1a1a1e"}}>{s.name}</option>)}
              </optgroup>
              <optgroup label="— Massages Magnétiques" style={{background:"#1a1a1e"}}>
                {SOINS.filter(s=>s.categorie==="Massages Magnétiques").map(s=><option key={s.id} value={s.id} style={{background:"#1a1a1e"}}>{s.name}</option>)}
              </optgroup>
              <optgroup label="— Programmes" style={{background:"#1a1a1e"}}>
                {SOINS.filter(s=>s.categorie==="Programmes").map(s=><option key={s.id} value={s.id} style={{background:"#1a1a1e"}}>{s.name}</option>)}
              </optgroup>
            </select>
          </div>
          <div style={{flex:1,minWidth:120}}>
            <div style={{fontSize:11,color:"#666",marginBottom:6}}>PLATEFORME</div>
            <select value={genPlatform} onChange={e=>setGenPlatform(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:10,
              background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#E8E0D4",fontSize:13,outline:"none"}}>
              {["Instagram","Facebook","Les deux"].map(p=><option key={p} value={p} style={{background:"#1a1a1e"}}>{p}</option>)}
            </select>
          </div>
          <div style={{flex:1,minWidth:120}}>
            <div style={{fontSize:11,color:"#666",marginBottom:6}}>TYPE</div>
            <select value={genType} onChange={e=>setGenType(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:10,
              background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#E8E0D4",fontSize:13,outline:"none"}}>
              {["Post","Story","Reel script","Caption"].map(t=><option key={t} value={t} style={{background:"#1a1a1e"}}>{t}</option>)}
            </select>
          </div>
        </div>
        <button onClick={generateContent} disabled={generating} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
          background:generating?"rgba(155,125,200,0.3)":"linear-gradient(135deg,#9B7DC8,#7B5DA8)",
          color:"#fff",fontSize:13,cursor:generating?"wait":"pointer",fontWeight:600,transition:"all 0.2s"}}>
          {generating?"✦ LYRA génère...":"✦ Générer le contenu"}
        </button>
      </div>

      {/* Contenus en attente */}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"#C9A96E",marginBottom:14}}>
        En attente de validation ({pendingContent.length})
      </div>
      {pendingContent.length===0 ? (
        <div style={{textAlign:"center",padding:"40px 0",color:"#555"}}>
          <div style={{fontSize:32,marginBottom:8}}>✦</div>
          <div>Aucun contenu en attente — demande à LYRA d'en générer !</div>
        </div>
      ) : pendingContent.map(item=>(
        <div key={item.id} style={{background:"rgba(255,255,255,0.025)",border:`1px solid ${item.color}44`,borderRadius:14,padding:"16px 18px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <Badge label={item.platform} color={item.color}/>
              <span style={{fontSize:11,color:"#666"}}>{item.type}</span>
              {item.soin && <Badge label={item.soin} color="#C9A96E"/>}
            </div>
            <span style={{fontSize:11,color:"#555",fontFamily:"monospace"}}>{item.time}</span>
          </div>
          <div style={{fontSize:12,color:"#aaa",lineHeight:1.7,marginBottom:12,
            maxHeight:expanded===item.id?"none":56,overflow:"hidden",cursor:"pointer",whiteSpace:"pre-line"}}
            onClick={()=>setExpanded(expanded===item.id?null:item.id)}>
            {item.preview}
            {expanded!==item.id && <span style={{color:item.color}}> …voir tout</span>}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>handleReject(item.id)} style={{padding:"7px 16px",borderRadius:8,border:"1px solid #ff6b6b44",background:"transparent",color:"#ff6b6b",fontSize:12,cursor:"pointer"}}>✕ Refuser</button>
            <button onClick={()=>handleValidate(item.id)} style={{padding:"7px 16px",borderRadius:8,border:"none",
              background:`linear-gradient(135deg,${item.color},${item.color}aa)`,color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600}}>
              {isConnected?"✓ Valider → Buffer":"✓ Valider"}
            </button>
          </div>
        </div>
      ))}

      {validated.length>0 && (
        <div style={{marginTop:24}}>
          <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:2}}>ENVOYÉS À BUFFER</div>
          {validated.slice(0,5).map((item,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"10px 16px",borderRadius:10,background:"rgba(76,175,138,0.05)",
              border:"1px solid rgba(76,175,138,0.15)",marginBottom:8,fontSize:12}}>
              <span style={{color:"#4CAF8A"}}>✓ {item.platform} — {item.type}</span>
              <span style={{color:"#555",fontFamily:"monospace"}}>{item.validatedAt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ONGLET SELENE SUIVI POST-SOIN ───────────────────────────────────────────

function SeleneTab({ onLog }) {
  const [brevoKey, setBrevoKey] = useState("");
  const [brevoConnected, setBrevoConnected] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [clients, setClients] = useState([
    {id:1, prenom:"Marine",  nom:"D.", soin:"ZÉNITH", date:"13 juin", tel:"06XXXXXXXX", statut:"suivi envoyé",   couleur:"#C9A96E"},
    {id:2, prenom:"Sophie",  nom:"M.", soin:"COCON",  date:"10 juin", tel:"06XXXXXXXX", statut:"suivi envoyé",   couleur:"#9B7DC8"},
    {id:3, prenom:"Clara",   nom:"R.", soin:"BALIZÉ", date:"17 juin", tel:"06XXXXXXXX", statut:"à envoyer",      couleur:"#C96E9B"},
    {id:4, prenom:"Isabelle",nom:"L.", soin:"HANASHI",date:"16 juin", tel:"06XXXXXXXX", statut:"programmé 48h",  couleur:"#6EAFC9"},
  ]);
  const [sending, setSending] = useState(null);
  const [newClient, setNewClient] = useState({prenom:"",nom:"",soin:"ZÉNITH",tel:""});
  const [showForm, setShowForm] = useState(false);

  const MESSAGES_SUIVI = {
    "Le Rituel Hanashi": (p) => `🌿 Bonjour ${p} ! Deux jours après Le Rituel Hanashi 話... votre peau vous a dit merci ? ✨ Cette cérémonie laisse des traces lumineuses. Si vous souhaitez retrouver cette magie, je garde quelques créneaux privilégiés pour vous — Géraldine Esther 🌸`,
    "Voyage des sens":   (p) => `🌿 Bonjour ${p} ! J'espère que vous portez encore en vous cette douceur du Voyage des sens 🌊 Votre corps vous dit merci. Si vous souhaitez replonger... je vous attends — Géraldine Esther ✨`,
    "Énergie de lumière":(p) => `🌿 Bonjour ${p} ! Comment vous sentez-vous depuis votre soin Énergie de lumière ? ✨ J'espère que vous ressentez cet alignement intérieur 🌟 N'hésitez pas à me partager votre ressenti — Géraldine Esther 🌸`,
    "Renaissance":       (p) => `🌿 Bonjour ${p} ! Deux jours après Renaissance... est-ce que vous sentez ce renouveau en vous ? 🦋 Votre corps a tourné une page. Je suis là si vous souhaitez continuer ce chemin — Géraldine Esther ✨`,
    "Vibre tes chakras": (p) => `🌿 Bonjour ${p} ! Comment vibrent vos chakras depuis notre séance ? 🎵 J'espère que vous ressentez cet alignement profond. Si vous souhaitez une nouvelle activation... — Géraldine Esther ✨`,
    "Sensei Soúl":       (p) => `🌿 Bonjour ${p} ! Deux jours après Sensei Soúl — est-ce que vous vous sentez plus léger·e ? 🌿 Délester ces mémoires était courageux. Je suis là pour la suite — Géraldine Esther ✨`,
    "Lahochi":           (p) => `🌿 Bonjour ${p} ! Comment vous sentez-vous depuis votre Lahochi ? ✋ J'espère que cette énergie circule bien en vous. N'hésitez pas à me dire — Géraldine Esther 🌸`,
    "Bye Bye C":         (p) => `🌿 Bonjour ${p} ! Comment se portent vos jambes depuis Bye Bye C ? ✨ J'espère que vous ressentez cette légèreté retrouvée 🌿 On continue la cure ? — Géraldine Esther`,
    "Koharu":            (p) => `🌿 Bonjour ${p} ! Est-ce que votre éclat naturel brille toujours depuis Koharu ? ✨ J'espère que vous voyez cette lumière dans votre visage 🌸 — Géraldine Esther`,
    "Lymphflow":         (p) => `🌿 Bonjour ${p} ! Comment se sentent vos jambes depuis Lymphflow ? 💧 J'espère que cette légèreté persiste. On programme la prochaine séance ? — Géraldine Esther ✨`,
    "The Body":          (p) => `🌿 Bonjour ${p} ! Deux jours après The Body — est-ce que votre corps vous remercie encore ? 🌿 Ce massage immersif laisse des traces profondes. Je vous attends pour la suite — Géraldine Esther ✨`,
    "Divine Body Flow":  (p) => `🌿 Bonjour ${p} ! Comment avancez-vous dans votre programme Divine Body Flow ? ✨ Chaque étape vous rapproche de votre féminin sacré 🌸 Je suis là si vous avez des questions — Géraldine Esther`,
    "KeyLight":          (p) => `🌿 Bonjour ${p} ! Comment résonne en vous votre activation KeyLight ? ✨ Ce code de lumière continue de travailler... Ressentez-vous les changements ? — Géraldine Esther 🌸`,
    "default":           (p) => `🌿 Bonjour ${p} ! J'espère que vous allez bien depuis votre soin. Votre corps vous remercie de l'avoir choyé 🌸 N'hésitez pas à me partager votre ressenti — Géraldine Esther ✨`,
  };

  const getMessage = (soin, prenom) => (MESSAGES_SUIVI[soin] || MESSAGES_SUIVI["default"])(prenom);

  const envoyerSuivi = async (client) => {
    if (!brevoConnected) { setShowSetup(true); return; }
    setSending(client.id);
    try {
      const msg = getMessage(client.soin, client.prenom);
      const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
        method:"POST",
        headers:{"api-key":brevoKey,"Content-Type":"application/json"},
        body:JSON.stringify({
          sender:"GeraldineE",
          recipient:client.tel.replace(/\s/g,"").replace(/^0/,"+33"),
          content:msg, type:"transactional",
        }),
      });
      const ok = res.ok;
      setClients(c=>c.map(x=>x.id===client.id?{...x,statut:ok?"suivi envoyé":"erreur envoi"}:x));
      onLog({time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
        agent:"SELENE",
        msg:ok?`❋ SMS suivi envoyé à ${client.prenom} (${client.soin})`:`⚠ Échec SMS — ${client.prenom}`,
        type:ok?"success":"warning"});
    } catch { setClients(c=>c.map(x=>x.id===client.id?{...x,statut:"erreur envoi"}:x)); }
    setSending(null);
  };

  const ajouterClient = () => {
    if (!newClient.prenom || !newClient.tel) return;
    setClients(c=>[...c,{id:Date.now(),...newClient,nom:"",date:"aujourd'hui",statut:"à envoyer",couleur:"#C96E9B"}]);
    setNewClient({prenom:"",nom:"",soin:"Le Rituel Hanashi",tel:""});
    setShowForm(false);
  };

  const statutStyle = {
    "suivi envoyé":  {color:"#4CAF8A",bg:"rgba(76,175,138,0.1)",border:"rgba(76,175,138,0.25)"},
    "programmé 48h": {color:"#6EAFC9",bg:"rgba(110,175,201,0.1)",border:"rgba(110,175,201,0.25)"},
    "à envoyer":     {color:"#C96E9B",bg:"rgba(201,110,155,0.1)",border:"rgba(201,110,155,0.25)"},
    "erreur envoi":  {color:"#ff8888",bg:"rgba(255,100,100,0.08)",border:"rgba(255,100,100,0.2)"},
  };

  return (
    <div style={{animation:"fadeIn 0.4s ease"}}>

      {/* Header SELENE */}
      <div style={{background:"rgba(201,110,155,0.06)",border:"1px solid rgba(201,110,155,0.2)",
        borderRadius:14,padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:24,color:"#C96E9B",filter:"drop-shadow(0 0 8px #C96E9B88)"}}>❋</span>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:15,color:"#E8A3C4",letterSpacing:2}}>SELENE — Suivi post-soin</div>
            <div style={{fontSize:11,color:"#777",marginTop:2}}>SMS personnalisé 48h après chaque soin</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowSetup(!showSetup)} style={{padding:"7px 14px",borderRadius:10,
            border:`1px solid ${brevoConnected?"rgba(76,175,138,0.3)":"rgba(201,110,155,0.3)"}`,
            background:"transparent",color:brevoConnected?"#4CAF8A":"#C96E9B",fontSize:12,cursor:"pointer"}}>
            {brevoConnected?"Brevo ✓":"Configurer Brevo"}
          </button>
          <button onClick={()=>setShowForm(!showForm)} style={{padding:"7px 14px",borderRadius:10,border:"none",
            background:"linear-gradient(135deg,#C96E9B,#A04E7B)",color:"#fff",fontSize:12,cursor:"pointer"}}>
            + Ajouter cliente
          </button>
        </div>
      </div>

      {/* Setup Brevo */}
      {showSetup && (
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(201,110,155,0.2)",
          borderRadius:12,padding:"16px 20px",marginBottom:16}}>
          <div style={{fontSize:12,color:"#C96E9B",marginBottom:10,letterSpacing:1}}>CLÉ API BREVO</div>
          <div style={{display:"flex",gap:8}}>
            <input value={brevoKey} onChange={e=>setBrevoKey(e.target.value)}
              placeholder="xkeysib-..."
              style={{flex:1,padding:"9px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.1)",color:"#E8E0D4",fontSize:12,outline:"none"}}/>
            <button onClick={()=>{if(brevoKey.length>10){setBrevoConnected(true);setShowSetup(false);}}} style={{
              padding:"9px 18px",borderRadius:10,border:"none",
              background:"linear-gradient(135deg,#C96E9B,#A04E7B)",
              color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600}}>Activer</button>
          </div>
        </div>
      )}

      {/* Formulaire ajout cliente */}
      {showForm && (
        <div style={{background:"rgba(201,110,155,0.04)",border:"1px solid rgba(201,110,155,0.2)",
          borderRadius:12,padding:"16px 20px",marginBottom:16}}>
          <div style={{fontSize:12,color:"#C96E9B",marginBottom:12,letterSpacing:1}}>NOUVELLE CLIENTE À SUIVRE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[{k:"prenom",l:"Prénom"},{k:"tel",l:"Téléphone"}].map(f=>(
              <div key={f.k}>
                <div style={{fontSize:10,color:"#666",marginBottom:5}}>{f.l.toUpperCase()}</div>
                <input value={newClient[f.k]} onChange={e=>setNewClient(c=>({...c,[f.k]:e.target.value}))}
                  style={{width:"100%",padding:"9px 12px",borderRadius:10,background:"rgba(255,255,255,0.04)",
                    border:"1px solid rgba(255,255,255,0.1)",color:"#E8E0D4",fontSize:12,outline:"none"}}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#666",marginBottom:5}}>SOIN REÇU</div>
            <select value={newClient.soin} onChange={e=>setNewClient(c=>({...c,soin:e.target.value}))}
              style={{width:"100%",padding:"9px 12px",borderRadius:10,background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)",color:"#E8E0D4",fontSize:12,outline:"none"}}>
              {["Énergie de lumière","Renaissance","Vibre tes chakras","Sensei Soúl","Lahochi","Bye Bye C","Koharu","Lymphflow","The Body","Voyage des sens","Le Rituel Hanashi","Divine Body Flow","KeyLight"].map(s=><option key={s} value={s} style={{background:"#1a1a1e"}}>{s}</option>)}
            </select>
          </div>
          {/* Aperçu du message */}
          <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(201,110,155,0.06)",
            border:"1px solid rgba(201,110,155,0.15)",marginBottom:12}}>
            <div style={{fontSize:10,color:"#C96E9B",marginBottom:6,letterSpacing:1}}>APERÇU DU MESSAGE SELENE</div>
            <div style={{fontSize:11,color:"#aaa",lineHeight:1.7}}>
              {getMessage(newClient.soin, newClient.prenom||"[Prénom]")}
            </div>
          </div>
          <button onClick={ajouterClient} style={{width:"100%",padding:"10px",borderRadius:10,border:"none",
            background:"linear-gradient(135deg,#C96E9B,#A04E7B)",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:600}}>
            ❋ Ajouter & programmer le suivi
          </button>
        </div>
      )}

      {/* Liste des clientes */}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"#888",marginBottom:14,letterSpacing:1}}>
        CLIENTES À SUIVRE ({clients.length})
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {clients.map(c=>{
          const st = statutStyle[c.statut] || statutStyle["à envoyer"];
          return (
            <div key={c.id} style={{borderRadius:14,overflow:"hidden",
              border:`1px solid ${st.border}`,background:st.bg}}>
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px"}}>
                <div style={{width:40,height:40,borderRadius:"50%",
                  background:`${c.couleur}22`,border:`1px solid ${c.couleur}44`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'Cinzel',serif",color:c.couleur,fontSize:14,fontWeight:600}}>
                  {c.prenom[0]}{c.nom[0]||""}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:"#E8E0D4",fontWeight:500}}>{c.prenom} {c.nom}</div>
                  <div style={{fontSize:11,color:"#777",marginTop:2}}>
                    <span style={{color:c.couleur}}>{c.soin}</span> · Soin du {c.date}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                  <span style={{padding:"4px 12px",borderRadius:20,fontSize:11,color:st.color,
                    background:"rgba(0,0,0,0.2)",border:`1px solid ${st.border}`}}>{c.statut}</span>
                  {c.statut==="à envoyer" && (
                    <button onClick={()=>envoyerSuivi(c)} disabled={sending===c.id} style={{
                      padding:"6px 14px",borderRadius:8,border:"none",fontSize:11,cursor:"pointer",
                      background:sending===c.id?"#333":"linear-gradient(135deg,#C96E9B,#A04E7B)",
                      color:sending===c.id?"#666":"#fff"}}>
                      {sending===c.id?"Envoi...":"❋ Envoyer"}
                    </button>
                  )}
                </div>
              </div>
              {/* Aperçu message au survol */}
              <div style={{padding:"10px 18px",borderTop:`1px solid ${st.border}`,
                background:"rgba(0,0,0,0.15)"}}>
                <div style={{fontSize:11,color:"#666",lineHeight:1.6,fontStyle:"italic"}}>
                  {getMessage(c.soin, c.prenom)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APPLICATION PRINCIPALE ───────────────────────────────────────────────────

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingContent, setPendingContent] = useState(PENDING_CONTENT_INIT);
  const [validated, setValidated] = useState([]);
  const [activityLog, setActivityLog] = useState(ACTIVITY_LOG_INIT);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {role:"agent",name:"LYRA",text:"Bonjour Géraldine ✨ J'ai préparé 2 posts cette semaine — un pour ZÉNITH, un pour COCON. Tu veux les voir dans l'onglet Buffer ?",color:"#9B7DC8"}
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[chatMessages]);

  const addLog = (entry) => setActivityLog(l=>[entry,...l].slice(0,20));

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput(""); setChatMessages(m=>[...m,{role:"user",text:userMsg}]); setIsLoading(true);
    const agent = selectedAgent ? AGENTS.find(a=>a.id===selectedAgent) : AGENTS[1];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`Tu es ${agent.name}, agent IA "${agent.role}" pour Géraldine Esther, thérapeute myofasciale en Seine-et-Marne.
Ses soins : ZÉNITH (cervicales, 90min, 80€), COCON (hamac & méditation, 90min, 90€), BALIZÉ (pierres volcaniques, 75min, 85€).
Ton rôle : ${agent.description}. Tu utilises Buffer pour publier sur Instagram & Facebook.
Ton : professionnel, spirituel, énergétique, touche d'humour bienveillant. Réponds en français, sois concis et propose des actions concrètes.`,
          messages:[{role:"user",content:userMsg}]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b=>b.type==="text")?.text||"Je réfléchis... 🌿";
      setChatMessages(m=>[...m,{role:"agent",name:agent.name,text,color:agent.color}]);
    } catch {
      setChatMessages(m=>[...m,{role:"agent",name:agent.name,text:"Connexion instable... réessaie dans un instant 🌙",color:agent.color}]);
    }
    setIsLoading(false);
  };

  const tabs = [
    {id:"dashboard",label:"Dashboard"},
    {id:"buffer",label:`✦ Buffer (${pendingContent.length})`},
    {id:"selene",label:"❋ Suivi SELENE"},
    {id:"chat",label:"💬 Agents"},
    {id:"activity",label:"Activité"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0A0A0C",fontFamily:"'Inter',sans-serif",color:"#E8E0D4"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes ping{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(2.2);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
        *{box-sizing:border-box}
        select option{background:#1a1a1e;color:#E8E0D4}
      `}</style>

      {/* Header */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"18px 28px",display:"flex",
        justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100,
        background:"rgba(10,10,12,0.97)",backdropFilter:"blur(20px)"}}>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:20,letterSpacing:4,color:"#C9A96E"}}>GÉRALDINE ESTHER</div>
          <div style={{fontSize:10,color:"#444",letterSpacing:3,marginTop:2}}>SUITE AGENTS IA — RÉSEAUX & BOOKING</div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          {pendingContent.length>0 && (
            <div style={{padding:"5px 12px",borderRadius:20,background:"rgba(201,169,110,0.12)",border:"1px solid #C9A96E33",fontSize:11,color:"#C9A96E"}}>
              ⚡ {pendingContent.length} à valider
            </div>
          )}
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#4CAF8A",boxShadow:"0 0 8px #4CAF8A"}}/>
            <span style={{fontSize:11,color:"#4CAF8A"}}>3 agents actifs</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 20px"}}>

        {/* Tabs */}
        <div style={{display:"flex",gap:3,marginBottom:28,background:"rgba(255,255,255,0.02)",borderRadius:12,padding:4,overflowX:"auto"}}>
          {tabs.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
              flex:1,minWidth:80,padding:"10px 12px",borderRadius:10,border:"none",
              background:activeTab===tab.id?"rgba(201,169,110,0.12)":"transparent",
              color:activeTab===tab.id?"#C9A96E":"#666",
              fontSize:12,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap",
              borderBottom:activeTab===tab.id?"2px solid #C9A96E":"2px solid transparent",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeTab==="dashboard" && (
          <div style={{animation:"fadeIn 0.4s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:14,marginBottom:24}}>
              {AGENTS.map(agent=>(
                <AgentCard key={agent.id} agent={agent} isSelected={selectedAgent===agent.id}
                  onClick={()=>setSelectedAgent(selectedAgent===agent.id?null:agent.id)}/>
              ))}
            </div>

            {selectedAgent && (()=>{
              const agent=AGENTS.find(a=>a.id===selectedAgent);
              return (
                <div style={{background:"linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",
                  border:`1px solid ${agent.color}44`,borderRadius:16,padding:"22px 26px",animation:"fadeIn 0.3s ease",marginBottom:24}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div>
                      <span style={{fontFamily:"'Cinzel',serif",fontSize:22,color:agent.accent,letterSpacing:3,marginRight:14}}>{agent.name}</span>
                      <span style={{fontSize:11,color:"#666",letterSpacing:2}}>{agent.role.toUpperCase()}</span>
                    </div>
                    <span style={{fontSize:32,filter:`drop-shadow(0 0 12px ${agent.color})`,animation:"float 3s ease-in-out infinite"}}>{agent.icon}</span>
                  </div>
                  <div style={{fontSize:13,color:"#888",marginBottom:16}}>{agent.description}</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginBottom:16}}>
                    {agent.tasks.map((task,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,
                        background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)"}}>
                        <span style={{color:agent.color,fontSize:10}}>▸</span>
                        <span style={{fontSize:12,color:"#bbb"}}>{task}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                    <button onClick={()=>{setActiveTab(agent.id==="content"?"buffer":agent.id==="fidelity"?"selene":"chat");}} style={{
                      padding:"9px 22px",borderRadius:10,border:`1px solid ${agent.color}44`,
                      background:`rgba(0,0,0,0)`,color:agent.color,fontSize:12,cursor:"pointer"}}>
                      Ouvrir {agent.role}
                    </button>
                    <button onClick={()=>{setSelectedAgent(agent.id);setActiveTab("chat");}} style={{
                      padding:"9px 22px",borderRadius:10,border:"none",
                      background:`linear-gradient(135deg,${agent.color},${agent.color}88)`,
                      color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600}}>
                      💬 Parler à {agent.name}
                    </button>
                  </div>
                </div>
              );
            })()}

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {[{label:"Posts Buffer ce mois",value:"14",icon:"✦",color:"#9B7DC8"},
                {label:"Suivi SELENE envoyés",value:"18",icon:"❋",color:"#C96E9B"},
                {label:"Clientes fidélisées",value:"22",icon:"⬡",color:"#6EAFC9"}].map(s=>(
                <div key={s.label} style={{background:"rgba(255,255,255,0.025)",border:`1px solid ${s.color}33`,
                  borderRadius:14,padding:"18px 20px",textAlign:"center"}}>
                  <div style={{fontSize:26,color:s.color,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontFamily:"monospace",fontSize:30,color:"#E8E0D4",fontWeight:700}}>{s.value}</div>
                  <div style={{fontSize:10,color:"#555",marginTop:4,letterSpacing:1}}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKING */}
        {activeTab==="booking" && <BookingTab onLog={addLog}/>}

        {/* SELENE SUIVI */}
        {activeTab==="selene" && <SeleneTab onLog={addLog}/>}

        {/* BUFFER */}
        {activeTab==="buffer" && (
          <BufferTab pendingContent={pendingContent} setPendingContent={setPendingContent}
            validated={validated} setValidated={setValidated} onLog={addLog}/>
        )}

        {/* CHAT */}
        {activeTab==="chat" && (
          <div style={{animation:"fadeIn 0.4s ease"}}>
            <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
              {AGENTS.map(a=>(
                <button key={a.id} onClick={()=>{
                  setSelectedAgent(a.id);
                  setChatMessages([{role:"agent",name:a.name,color:a.color,
                    text:`Bonjour Géraldine ! Je suis ${a.name}, ton agent ${a.role.toLowerCase()}. Comment puis-je t'aider ? ✨`}]);
                }} style={{padding:"8px 16px",borderRadius:20,border:`1px solid ${selectedAgent===a.id?a.color:a.color+"44"}`,
                  background:selectedAgent===a.id?a.color+"22":"transparent",
                  color:selectedAgent===a.id?a.accent:a.color,fontSize:12,cursor:"pointer",
                  fontFamily:"'Cinzel',serif",letterSpacing:1}}>{a.icon} {a.name}</button>
              ))}
            </div>
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",
              borderRadius:16,padding:20,minHeight:360,maxHeight:400,overflowY:"auto",marginBottom:14}}>
              {chatMessages.map((msg,i)=>(
                <div key={i} style={{marginBottom:14,display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",animation:"fadeIn 0.3s ease"}}>
                  {msg.role==="agent" ? (
                    <div style={{padding:"12px 16px",borderRadius:"14px 14px 14px 4px",background:"rgba(255,255,255,0.04)",
                      border:`1px solid ${msg.color}44`,maxWidth:"78%"}}>
                      <div style={{fontSize:10,color:msg.color,marginBottom:5,letterSpacing:2,fontFamily:"'Cinzel',serif"}}>{msg.name}</div>
                      <div style={{fontSize:13,color:"#ccc",lineHeight:1.7}}>{msg.text}</div>
                    </div>
                  ) : (
                    <div style={{padding:"12px 16px",borderRadius:"14px 14px 4px 14px",background:"rgba(201,169,110,0.1)",
                      border:"1px solid #C9A96E33",maxWidth:"78%"}}>
                      <div style={{fontSize:13,color:"#E8D5A3",lineHeight:1.7}}>{msg.text}</div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div style={{display:"flex",gap:5,padding:"12px 14px"}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:7,height:7,borderRadius:"50%",
                      background:selectedAgent?AGENTS.find(a=>a.id===selectedAgent)?.color:"#C9A96E",
                      animation:`ping ${0.8+i*0.2}s ease-in-out infinite`}}/>
                  ))}
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&sendMessage()}
                placeholder={`Parle à ${selectedAgent?AGENTS.find(a=>a.id===selectedAgent)?.name:"un agent"}...`}
                style={{flex:1,padding:"13px 16px",borderRadius:12,background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.1)",color:"#E8E0D4",fontSize:13,outline:"none"}}/>
              <button onClick={sendMessage} style={{padding:"13px 22px",borderRadius:12,border:"none",
                background:"linear-gradient(135deg,#C9A96E,#A07840)",color:"#0A0A0C",fontSize:16,cursor:"pointer",fontWeight:700}}>→</button>
            </div>
          </div>
        )}

        {/* ACTIVITÉ */}
        {activeTab==="activity" && (
          <div style={{animation:"fadeIn 0.4s ease"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:15,color:"#C9A96E",marginBottom:20}}>Journal temps réel</div>
            {activityLog.map((log,i)=>{
              const agent=AGENTS.find(a=>a.name===log.agent);
              const ts={success:{color:"#4CAF8A",bg:"rgba(76,175,138,0.08)",border:"rgba(76,175,138,0.2)"},
                info:{color:"#6EAFC9",bg:"rgba(110,175,201,0.08)",border:"rgba(110,175,201,0.2)"},
                pending:{color:"#C9A96E",bg:"rgba(201,169,110,0.08)",border:"rgba(201,169,110,0.2)"},
                warning:{color:"#E8A060",bg:"rgba(232,160,96,0.08)",border:"rgba(232,160,96,0.2)"}}[log.type];
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:12,
                  marginBottom:8,background:ts.bg,border:`1px solid ${ts.border}`,animation:`fadeIn ${0.1+i*0.06}s ease`}}>
                  <span style={{fontFamily:"monospace",fontSize:11,color:"#555",minWidth:38}}>{log.time}</span>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,letterSpacing:1,
                    background:(agent?.color||"#888")+"22",color:agent?.color||"#888",
                    fontFamily:"'Cinzel',serif",whiteSpace:"nowrap"}}>{log.agent}</span>
                  <span style={{fontSize:12,color:"#ccc",flex:1}}>{log.msg}</span>
                  <span style={{fontSize:16,color:ts.color}}>{{success:"✓",info:"ℹ",pending:"⏳",warning:"⚠"}[log.type]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
