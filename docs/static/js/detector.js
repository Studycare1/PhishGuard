// PhishGuard client-side detector

const CHEAP_TLDS = [".tk",".ml",".ga",".cf",".gq",".xyz",".top",".work",".click",".link",".online",".site",".website",".space",".live",".fun",".icu",".cyber",".rest",".monster",".quest",".buzz",".bar",".cam",".cfd",".sbs"];
const URL_SHORTENERS = ["bit.ly","tinyurl.com","t.co","goo.gl","ow.ly","is.gd","buff.ly","rebrand.ly","cutt.ly","shorturl.at","tiny.cc","rb.gy","shorte.st","bl.ink","lnkd.in"];
const BRANDS = ["instagram","facebook","paypal","amazon","google","microsoft","apple","netflix","whatsapp","hdfc","icici","sbi","axis","flipkart","linkedin","twitter","youtube","gmail","outlook","dropbox","github","steam","binance","coinbase","metamask","zoom","slack","teams","adobe","openai","chatgpt","kotak","yesbank","pnb","phonepe","paytm","gpay","bhim","irctc","uidai","incometax","epfo","reliance","jio","airtel","vodafone","myntra","snapdeal","meesho","swiggy","zomato"];
const HOMOGRAPH_TRICKS = ["faceb00k","1nstagram","paypa1","g00gle","amaz0n","wh4tsapp","netfl1x","flipk4rt","micr0soft","app1e","linked1n","tw1tter","y0utube","dr0pbox","g1thub","z00m","sl4ck","chatgpt","openai","hdfc","1cici","sb1","ax1s","k0tak","pa7tm","ph0nepe"];
const URGENCY_WORDS = ["verify","secure","update","kyc","signin","account-check","confirm","validate","urgent","alert","suspended","locked","expire","blocked","recovery","unlock","unusual","suspicious","immediate","actnow","limitedtime","lastchance","finalnotice","warning","penalty"];
const SUSPICIOUS_EXTS = [".exe",".scr",".bat",".cmd",".com",".pif",".vbs",".js",".jar",".msi",".app",".dmg",".zip",".rar",".7z",".apk",".iso",".img"];
const LOGIN_PATHS = ["login","signin","sign-in","log-in","account","verify","auth","secure","update","confirm","recover","unlock","validate"];
const DANGEROUS_WORDS = ["free","giveaway","winner","claim","prize","lottery","airdrop","wallet-connect","seed","metamask","nft","bonus","reward","giftcard","refund","cashback","jackpot","earn-money","work-from-home"];
const WEB3_WORDS = ["metamask","walletconnect","opensea","uniswap","pancakeswap","trustwallet","coinbase-wallet","phantom","solflare","nft-mint","defi","web3","airdrop"];

function _hostOf(url) {
  try {
    const u = new URL(url.includes("://") ? url : "http://" + url);
    return { host: u.hostname || "", parsed: u };
  } catch (e) { return { host: "", parsed: null }; }
}

function detect(url) {
  if (!url || typeof url !== "string") return { url:"", risk:0, verdict:"UNKNOWN", color:"green", findings:[], host:"" };
  const findings = [];
  const { host, parsed } = _hostOf(url);
  const hl = host.toLowerCase();
  const ul = url.toLowerCase();

  if (!url.startsWith("https://") && url.startsWith("http://")) findings.push({ id:"protocol", level:"warn", msg:"HTTP use ho raha hai (HTTPS nahi)", detail:"Asli sites hamesha HTTPS use karti hain." });
  CHEAP_TLDS.forEach(t => { if (hl.endsWith(t)) findings.push({ id:"cheap_tld", level:"high", msg:"Sasta/free TLD ("+t+")", detail:"Ye domains free milte hain. 90% phishing inhi pe." }); });
  BRANDS.forEach(b => { if (hl.includes(b)) { const parts = hl.split("."); if (parts.length >= 2) { const real = parts.slice(-2).join("."); if (!real.includes(b)) findings.push({ id:"brand_subdomain", level:"critical", msg:"Brand '"+b+"' asli domain me nahi hai", detail:"Brand URL me hai, par asli domain '"+real+"' hai." }); } } });
  const hyphens = (host.match(/-/g) || []).length;
  if (hyphens >= 3) findings.push({ id:"hyphens", level:"high", msg:"Domain me "+hyphens+" hyphens", detail:"3+ hyphens phishing ka strong sign." });
  else if (hyphens === 2) findings.push({ id:"hyphens", level:"warn", msg:"Domain me 2 hyphens", detail:"Asli sites 0-1 hyphen use karti hain." });
  HOMOGRAPH_TRICKS.forEach(t => { if (hl.includes(t)) findings.push({ id:"homograph", level:"critical", msg:"Brand name me number trick ('"+t+"')", detail:"0 ki jagah O, 1 ki jagah I — visually same." }); });
  const urgHits = URGENCY_WORDS.filter(w => ul.includes(w));
  if (urgHits.length) findings.push({ id:"urgency", level:"warn", msg:"Urgency words: "+urgHits.slice(0,3).join(", "), detail:"Ye words phishing URLs me common hain." });
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) findings.push({ id:"ip_url", level:"critical", msg:"URL me IP address hai", detail:"IP-based URLs almost always malicious." });
  const afterProto = url.includes("://") ? url.split("://")[1].split("/")[0] : url.split("/")[0];
  if (afterProto.includes("@")) findings.push({ id:"at_symbol", level:"critical", msg:"URL host me '@' symbol", detail:"http://google.com@evil.com — browser google dikhata, evil khulta." });
  if (URL_SHORTENERS.includes(hl)) findings.push({ id:"shortener", level:"warn", msg:"URL shortener ("+host+")", detail:"Asli destination chhupa hai." });
  if (parsed && parsed.port && ![80,443,8080,8443].includes(parseInt(parsed.port))) findings.push({ id:"port", level:"warn", msg:"Non-standard port ("+parsed.port+")", detail:"Asli sites standard ports use karti hain." });
  if (url.length > 120) findings.push({ id:"long_url", level:"high", msg:"URL bahut lamba ("+url.length+" chars)", detail:"Lamba URL me cheezein chhupayi ja sakti hain." });
  else if (url.length > 75) findings.push({ id:"long_url", level:"warn", msg:"URL lamba ("+url.length+" chars)", detail:"Chhota URL safer lagta hai." });
  if (ul.includes("xn--")) findings.push({ id:"punycode", level:"critical", msg:"Punycode detected (xn--)", detail:"International chars ko ASCII me encode." });
  const parts = host.split(".");
  if (parts.length >= 2) {
    const dom = parts[parts.length - 2].toLowerCase();
    const lev = (a,b) => { if (Math.abs(a.length-b.length)>2) return 99; const m=a.length,n=b.length; const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0)); for(let i=0;i<=m;i++)dp[i][0]=i; for(let j=0;j<=n;j++)dp[0][j]=j; for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]!==b[j-1]?1:0)); return dp[m][n]; };
    for (const b of BRANDS) { const d = lev(dom,b); if (d>0 && d<=2 && dom!==b) { findings.push({ id:"typosquat", level:"high", msg:"Domain '"+dom+"' '"+b+"' jaisa hai", detail:"Edit distance "+d }); break; } }
  }
  if (parts.length > 4) findings.push({ id:"many_subdomains", level:"warn", msg:"Bahut subdomains", detail:"Confusing structure." });
  SUSPICIOUS_EXTS.forEach(ext => { if (ul.endsWith(ext) || ul.includes(ext+"?") || ul.includes(ext+"#")) findings.push({ id:"suspicious_ext", level:"critical", msg:"Suspicious extension ("+ext+")", detail:"Direct download mat karo." }); });
  if (/\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif|txt|csv|ppt|pptx)\.(exe|scr|bat|cmd|js|vbs|jar|com|pif|msi|apk)/i.test(url)) findings.push({ id:"double_extension", level:"critical", msg:"Double extension detected", detail:"report.pdf.exe — executable hai." });
  if (ul.startsWith("data:")) findings.push({ id:"data_uri", level:"critical", msg:"Data URI", detail:"Inline content." });
  if (ul.startsWith("javascript:")) findings.push({ id:"javascript_uri", level:"critical", msg:"JavaScript URI", detail:"Code execute karta hai." });
  const pctCount = (url.match(/%/g) || []).length;
  if (pctCount >= 8) findings.push({ id:"percent_encoding", level:"high", msg:"Bahut percent-encoding ("+pctCount+")", detail:"URL obfuscated hai." });
  else if (pctCount >= 4) findings.push({ id:"percent_encoding", level:"warn", msg:"Percent-encoding ("+pctCount+")", detail:"Kuch chars encoded." });
  if (url.includes("://")) { const after = url.split("://")[1]; if (after.includes("//")) findings.push({ id:"double_slash", level:"warn", msg:"Path me '//'", detail:"Open redirect sign." }); }
  const loginHits = LOGIN_PATHS.filter(p => ul.includes(p));
  if (loginHits.length && [".tk",".xyz",".ml",".ga",".cf",".gq",".icu",".top",".click"].some(t => ul.includes(t))) findings.push({ id:"login_cheap", level:"high", msg:"Login page sasta TLD pe", detail:"Login + free TLD = suspicious." });
  const dangerHits = DANGEROUS_WORDS.filter(w => ul.includes(w));
  if (dangerHits.length) findings.push({ id:"dangerous_words", level:"warn", msg:"Bait words: "+dangerHits.slice(0,3).join(", "), detail:"Free/giveaway/crypto bait." });
  const web3Hits = WEB3_WORDS.filter(w => ul.includes(w));
  if (web3Hits.length) findings.push({ id:"web3_words", level:"high", msg:"Web3/crypto bait", detail:"Wallet drainer ka sign." });
  for (const ch of host) { if (ch.charCodeAt(0) > 127 && ch !== "." && ch !== "-") { findings.push({ id:"unicode", level:"high", msg:"Non-ASCII characters", detail:"Homograph attack possible." }); break; } }
  if ((host.match(/\./g) || []).length >= 5) findings.push({ id:"deep_subdomain", level:"high", msg:"Deep subdomain chain", detail:"Real domain aakhri 2 me." });
  if (url.includes("?")) { const q = url.split("?")[1].toLowerCase(); if (["redirect=","url=","next=","return=","continue=","dest=","target="].some(p => q.includes(p)) && q.includes("http")) findings.push({ id:"open_redirect", level:"high", msg:"Open redirect parameter", detail:"Kahin aur bhej sakta hai." }); }
  if (host.endsWith(".")) findings.push({ id:"trailing_dot", level:"warn", msg:"Trailing dot", detail:"DNS trick." });
  if (/%[0-9a-fA-F]{2}%[0-9a-fA-F]{2}%[0-9a-fA-F]{2}/.test(url)) findings.push({ id:"hex_encoding", level:"warn", msg:"Hex-encoded sequence", detail:"URL obfuscation." });
  if (url.includes("?")) { const n = (url.split("?")[1].match(/&/g) || []).length; if (n > 6) findings.push({ id:"query_params_many", level:"warn", msg:"Bahut query params", detail:"Hiding technique." }); }
  if (url.includes("#")) { const frag = url.split("#")[1]; if (frag.toLowerCase().includes("http")) findings.push({ id:"hash_redirect", level:"warn", msg:"Hash me URL", detail:"Fragment redirect." }); }
  BRANDS.forEach(b => { if (hl.includes(b)) { const idx = hl.indexOf(b); const after = hl.substr(idx + b.length, 3); if (after && /\d/.test(after)) findings.push({ id:"digit_in_brand", level:"high", msg:"Brand ke baad digit", detail:"Brand+digit typosquat." }); } });
  if (/(.)\1{3,}/.test(host)) findings.push({ id:"repeated_chars", level:"warn", msg:"Repeated characters", detail:"Pattern phishing." });
  ["gov-in.co","gov.in.","gov-in.tk","gov-in.xyz",".gov-","-gov.","govt-","-govt.","incometax-","-incometax","irdai-","-irdai","uidai-","-uidai"].forEach(p => { if (ul.includes(p)) findings.push({ id:"gov_lookalike", level:"critical", msg:"Government lookalike '"+p+"'", detail:"Impersonation possible." }); });
  ["bank-verify","bank-secure","bank-update","-bank.","bank.","kyc-","-kyc","netbanking-","net-banking","upi-verify","upi-update"].forEach(w => { if (ul.includes(w)) findings.push({ id:"bank_lookalike", level:"high", msg:"Banking lookalike: "+w, detail:"Banking phishing pattern." }); });
  BRANDS.forEach(b => { if (hl.includes("-"+b) || hl.includes(b+"-")) findings.push({ id:"dash_in_brand", level:"high", msg:"Brand ke saath dash ('"+b+"')", detail:"Brand+hyphen pattern." }); });
  const foundBrands = BRANDS.filter(b => hl.includes(b));
  if (foundBrands.length >= 2) findings.push({ id:"multiple_brands", level:"high", msg:"Multiple brands: "+foundBrands.slice(0,3).join(", "), detail:"Confusion trick." });
  BRANDS.forEach(b => { if (hl.startsWith(b+".") && !hl.split(".").slice(-2).join(".").includes(b)) findings.push({ id:"subdomain_of_brand", level:"high", msg:"Brand as subdomain", detail:"Classic phishing." }); });
  if (["password=","passwd=","pwd=","token=","apikey=","api_key=","secret="].some(w => ul.includes(w))) findings.push({ id:"creds_in_url", level:"critical", msg:"URL me credentials/token", detail:"Sensitive data URL me." });
  if (host.includes("@")) findings.push({ id:"email_host", level:"critical", msg:"Host me email jaisa structure", detail:"Credentials @ trick." });

  const sm = {low:5, warn:15, high:30, critical:50};
  let score = 0;
  findings.forEach(f => { score += sm[f.level] || 0; });
  score = Math.min(score, 100);
  let verdict, color;
  if (score === 0) { verdict = "SAFE"; color = "green"; }
  else if (score < 25) { verdict = "SUSPICIOUS"; color = "yellow"; }
  else if (score < 60) { verdict = "LIKELY PHISHING"; color = "orange"; }
  else { verdict = "PHISHING"; color = "red"; }
  return { url, risk: score, verdict, color, findings, host };
}

function analyzePassword(password) {
  if (!password) return { score:0, label:"EMPTY", color:"red", issues:[], tips:[] };
  let score = 0; const issues = [], tips = []; const p = password, length = p.length;
  if (length < 8) { issues.push("Bahut chhota ("+length+" chars)"); tips.push("8+ characters rakho"); }
  else if (length < 12) { score += 15; tips.push("12+ characters recommended"); }
  else if (length < 16) score += 25; else score += 35;
  const hasLower = /[a-z]/.test(p), hasUpper = /[A-Z]/.test(p), hasDigit = /\d/.test(p), hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:',.<>\/?~`]/.test(p);
  const types = [hasLower,hasUpper,hasDigit,hasSymbol].filter(Boolean).length;
  score += types * 10;
  if (!hasLower) tips.push("Lowercase add karo"); if (!hasUpper) tips.push("Uppercase add karo");
  if (!hasDigit) tips.push("Numbers add karo"); if (!hasSymbol) tips.push("Symbols add karo");
  const common = ["password","123456","qwerty","admin","letmein","welcome","monkey","dragon","master","sunshine","iloveyou","abc123","12345678","1234567890","football","baseball","starwars"];
  if (common.includes(p.toLowerCase())) return { score:5, label:"COMMON", color:"red", issues:["Ye top-100 list me hai"], tips:["Turant change karo"], length, types, crack_time:"instant", entropy:0 };
  common.forEach(cw => { if (cw.length >= 4 && p.toLowerCase().includes(cw)) { issues.push("'"+cw+"' common"); score -= 15; } });
  if (/(.)\1{2,}/.test(p)) { issues.push("Repeated chars"); score -= 10; }
  if (/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|xyz)/i.test(p)) { issues.push("Sequential pattern"); score -= 10; }
  if (/(qwerty|asdf|zxcv|poiu|lkjh)/i.test(p)) { issues.push("Keyboard pattern"); score -= 15; }
  if (p.split(/\s+/).length >= 4) { score += 15; tips.push("Passphrase — good!"); }
  score = Math.max(0, Math.min(100, score));
  let label, color;
  if (score < 25) { label = "VERY WEAK"; color = "red"; }
  else if (score < 45) { label = "WEAK"; color = "red"; }
  else if (score < 65) { label = "MEDIUM"; color = "orange"; }
  else if (score < 85) { label = "STRONG"; color = "green"; }
  else { label = "VERY STRONG"; color = "green"; }
  let charset = 0;
  if (hasLower) charset += 26; if (hasUpper) charset += 26; if (hasDigit) charset += 10; if (hasSymbol) charset += 32;
  if (!charset) charset = 26;
  const sec = Math.pow(charset, length) / 1e10 / 2;
  const fmt = s => { if (s<1) return "instant"; if (s<60) return Math.floor(s)+" seconds"; if (s<3600) return Math.floor(s/60)+" minutes"; if (s<86400) return Math.floor(s/3600)+" hours"; if (s<2592000) return Math.floor(s/86400)+" days"; if (s<31536000) return Math.floor(s/2592000)+" months"; if (s<31536000*1000) return Math.floor(s/31536000)+" years"; return "centuries+"; };
  return { score, label, color, issues, tips: tips.slice(0,4), length, types, crack_time: fmt(sec), entropy: Math.round(length * Math.log2(charset)) };
}

function analyzeEmail(text) {
  if (!text || !text.trim()) return { score:0, findings:[], verdict:"EMPTY", color:"green", url_count:0 };
  const t = text.toLowerCase(); const findings = []; let score = 0;
  const uh = ["urgent","immediately","act now","24 hours","48 hours","today only","expires","final notice","last warning","turant","abhi","jaldi","khatam"].filter(w => t.includes(w));
  if (uh.length) { findings.push({ level:"warn", msg:"Urgency words: "+uh.slice(0,4).join(", "), detail:"Urgency create karta hai." }); score += 15; }
  const th = ["account will be","suspend","blocked","deleted","legal action","arrest","penalty","freeze","band ho","block ho","delete ho"].filter(w => t.includes(w));
  if (th.length) { findings.push({ level:"warn", msg:"Threat language: "+th.slice(0,3).join(", "), detail:"Fear exploit." }); score += 15; }
  const sh = ["otp","password","pin","cvv","credit card","aadhaar","pan","ssn","net banking","seed phrase","recovery phrase","private key"].filter(w => t.includes(w));
  if (sh.length) { findings.push({ level:"critical", msg:"Sensitive info request: "+sh.slice(0,3).join(", "), detail:"Koi legit org OTP nahi maangta." }); score += 40; }
  const urls = text.match(/https?:\/\/[^\s\)\]\}]+/g) || [];
  urls.slice(0,5).forEach(url => { const r = detect(url); if (r.risk >= 40) { findings.push({ level:"critical", msg:"Suspicious URL: "+url.slice(0,60), detail:"Risk "+r.risk+"/100" }); score += 25; } else if (r.risk >= 15) { findings.push({ level:"warn", msg:"URL check: "+url.slice(0,60), detail:"Risk "+r.risk+"/100" }); score += 10; } });
  const gh = ["dear customer","dear user","dear member","dear sir/madam","valued customer","dear account holder","dear taxpayer"].filter(w => t.includes(w));
  if (gh.length) { findings.push({ level:"warn", msg:"Generic greeting: "+gh[0], detail:"Asli companies naam use karti." }); score += 10; }
  const bh = ["free","winner","won ","prize","lottery","claim","gift card","cash reward","crore","lakh"].filter(w => t.includes(w));
  if (bh.length) { findings.push({ level:"warn", msg:"Bait words: "+bh.slice(0,3).join(", "), detail:"Free money/prize scams." }); score += 10; }
  if (/@[\w-]+\.(tk|ml|ga|cf|gq|xyz|top|click)\b/.test(t)) { findings.push({ level:"critical", msg:"Sender domain sasta TLD", detail:".tk, .ml phishing common." }); score += 30; }
  score = Math.min(score, 100);
  let verdict, color;
  if (score === 0) { verdict = "LOOKS SAFE"; color = "green"; }
  else if (score < 25) { verdict = "LOW RISK"; color = "yellow"; }
  else if (score < 55) { verdict = "SUSPICIOUS"; color = "orange"; }
  else { verdict = "LIKELY PHISHING"; color = "red"; }
  return { score, verdict, color, findings, url_count: urls.length };
}
