"""PhishGuard URL Detector — 45 pattern-based checks"""
from __future__ import annotations
import ipaddress
import re
from urllib.parse import urlparse

CHEAP_TLDS = {".tk",".ml",".ga",".cf",".gq",".xyz",".top",".work",".click",".link",
              ".online",".site",".website",".space",".live",".fun",".icu",".cyber",
              ".rest",".monster",".quest",".buzz",".bar",".cam",".cfd",".sbs"}

URL_SHORTENERS = {"bit.ly","tinyurl.com","t.co","goo.gl","ow.ly","is.gd","buff.ly",
                  "rebrand.ly","cutt.ly","shorturl.at","tiny.cc","rb.gy","shorte.st",
                  "bl.ink","lnkd.in","soo.gd","v.gd","clck.ru","u.to","po.st","x.co"}

BRANDS = ["instagram","facebook","paypal","amazon","google","microsoft","apple",
          "netflix","whatsapp","hdfc","icici","sbi","axis","flipkart","linkedin",
          "twitter","youtube","gmail","outlook","dropbox","github","steam","binance",
          "coinbase","metamask","zoom","slack","teams","adobe","openai","chatgpt",
          "kotak","yesbank","pnb","bankofbaroda","phonepe","paytm","gpay","bhim",
          "irctc","uidai","incometax","epfo","reliance","jio","airtel","vodafone",
          "myntra","snapdeal","meesho","swiggy","zomato"]

HOMOGRAPH_TRICKS = ["faceb00k","1nstagram","paypa1","g00gle","amaz0n","wh4tsapp",
                    "netfl1x","flipk4rt","micr0soft","app1e","linked1n","tw1tter",
                    "y0utube","dr0pbox","g1thub","z00m","sl4ck","chatgpt","openai",
                    "hdfc","1cici","sb1","ax1s","k0tak","pa7tm","ph0nepe"]

URGENCY_WORDS = ["verify","secure","update","kyc","signin","account-check","confirm",
                 "validate","urgent","alert","suspended","locked","expire","blocked",
                 "recovery","unlock","unusual","suspicious","immediate","actnow",
                 "limitedtime","lastchance","finalnotice","warning","penalty"]

SUSPICIOUS_EXTS = [".exe",".scr",".bat",".cmd",".com",".pif",".vbs",".js",".jar",
                   ".msi",".app",".dmg",".zip",".rar",".7z",".apk",".iso",".img"]

LOGIN_PATHS = ["login","signin","sign-in","log-in","account","verify","auth",
               "secure","update","confirm","recover","unlock","validate"]

DANGEROUS_WORDS = ["free","giveaway","winner","claim","prize","lottery","airdrop",
                   "wallet-connect","seed","metamask","nft","bonus","reward",
                   "giftcard","refund","cashback","jackpot","earn-money","work-from-home"]

WEB3_WORDS = ["metamask","walletconnect","opensea","uniswap","pancakeswap","trustwallet",
              "coinbase-wallet","phantom","solflare","nft-mint","defi","web3","airdrop"]


def _host_of(url):
    try:
        parsed = urlparse(url if "://" in url else "http://" + url)
        return parsed.hostname or "", parsed
    except Exception:
        return "", None


def ck_protocol(url):
    if url.startswith("https://"): return None
    if url.startswith("http://"):
        return {"id":"protocol","level":"warn","msg":"HTTP use ho raha hai (HTTPS nahi)",
                "detail":"Asli sites hamesha HTTPS use karti hain."}
    return None

def ck_no_scheme(url):
    if "://" not in url and not url.startswith(("data:","javascript:","mailto:","tel:")):
        return {"id":"no_scheme","level":"low","msg":"Koi protocol prefix nahi",
                "detail":"Bina scheme ke URL suspicious ho sakta hai."}
    return None

def ck_cheap_tld(url):
    h,_ = _host_of(url)
    for tld in CHEAP_TLDS:
        if h.endswith(tld):
            return {"id":"cheap_tld","level":"high","msg":f"Sasta/free TLD ({tld})",
                    "detail":"Ye domains free milte hain. 90% phishing inhi pe."}
    return None

def ck_brand_subdomain(url):
    h,_ = _host_of(url); hl = h.lower()
    for b in BRANDS:
        if b in hl:
            parts = hl.split(".")
            if len(parts) >= 2:
                real = ".".join(parts[-2:])
                if b not in real:
                    return {"id":"brand_subdomain","level":"critical",
                            "msg":f"Brand '{b}' asli domain me nahi hai",
                            "detail":f"Brand URL me hai, par asli domain '{real}' hai."}
    return None

def ck_hyphens(url):
    h,_ = _host_of(url); n = h.count("-")
    if n >= 3:
        return {"id":"hyphens","level":"high","msg":f"Domain me {n} hyphens",
                "detail":"3+ hyphens phishing ka strong sign."}
    if n == 2:
        return {"id":"hyphens","level":"warn","msg":f"Domain me {n} hyphens",
                "detail":"Asli sites 0-1 hyphen use karti hain."}
    return None

def ck_homograph(url):
    h,_ = _host_of(url); hl = h.lower()
    for t in HOMOGRAPH_TRICKS:
        if t in hl:
            return {"id":"homograph","level":"critical",
                    "msg":f"Brand name me number trick ('{t}')",
                    "detail":"0 ki jagah O, 1 ki jagah I — visually same."}
    return None

def ck_urgency(url):
    ul = url.lower()
    hits = [w for w in URGENCY_WORDS if w in ul]
    if hits:
        return {"id":"urgency","level":"warn",
                "msg":f"Urgency words: {', '.join(hits[:3])}",
                "detail":"Ye words phishing URLs me bahut common hain."}
    return None

def ck_ip_url(url):
    h,_ = _host_of(url)
    try:
        ipaddress.ip_address(h)
        return {"id":"ip_url","level":"critical","msg":"URL me IP address hai",
                "detail":"IP-based URLs almost always malicious."}
    except ValueError:
        return None

def ck_at_symbol(url):
    if "@" in url.split("://",1)[-1].split("/",1)[0]:
        return {"id":"at_symbol","level":"critical","msg":"URL host me '@' symbol",
                "detail":"http://google.com@evil.com — browser google dikhata, evil khulta."}
    return None

def ck_shortener(url):
    h,_ = _host_of(url)
    if h.lower() in URL_SHORTENERS:
        return {"id":"shortener","level":"warn","msg":f"URL shortener ({h})",
                "detail":"Asli destination chhupa hai."}
    return None

def ck_port(url):
    _,p = _host_of(url)
    if p and p.port and p.port not in (80,443,8080,8443):
        return {"id":"port","level":"warn","msg":f"Non-standard port ({p.port})",
                "detail":"Asli sites standard ports use karti hain."}
    return None

def ck_long_url(url):
    if len(url) > 120:
        return {"id":"long_url","level":"high","msg":f"URL bahut lamba ({len(url)} chars)",
                "detail":"Lamba URL me cheezein chhupayi ja sakti hain."}
    if len(url) > 75:
        return {"id":"long_url","level":"warn","msg":f"URL lamba ({len(url)} chars)",
                "detail":"Chhota URL usually safer lagta hai."}
    return None

def ck_punycode(url):
    if "xn--" in url.lower():
        return {"id":"punycode","level":"critical","msg":"Punycode detected (xn--)",
                "detail":"International chars ko ASCII me encode — homograph."}
    return None

def ck_typosquat(url):
    h,_ = _host_of(url)
    parts = h.split(".")
    if len(parts) < 2: return None
    dom = parts[-2].lower()
    def lev(a,b):
        if abs(len(a)-len(b))>2: return 99
        m,n = len(a),len(b)
        dp = list(range(n+1))
        for i in range(1,m+1):
            prev = dp[0]; dp[0] = i
            for j in range(1,n+1):
                cur = dp[j]
                dp[j] = min(dp[j]+1,dp[j-1]+1,prev+(a[i-1]!=b[j-1]))
                prev = cur
        return dp[n]
    for b in BRANDS:
        d = lev(dom,b)
        if 0 < d <= 2 and dom != b:
            return {"id":"typosquat","level":"high",
                    "msg":f"Domain '{dom}' '{b}' jaisa hai",
                    "detail":f"Edit distance {d} — typo karke banaya."}
    return None

def ck_many_subdomains(url):
    h,_ = _host_of(url)
    parts = h.split(".")
    if len(parts) > 4:
        return {"id":"many_subdomains","level":"warn",
                "msg":f"Bahut subdomains ({len(parts)} levels)",
                "detail":"Confusing structure — real domain aakhri 2 me."}
    return None

def ck_suspicious_ext(url):
    ul = url.lower()
    for ext in SUSPICIOUS_EXTS:
        if ul.endswith(ext) or ext+"?" in ul or ext+"#" in ul:
            return {"id":"suspicious_ext","level":"critical",
                    "msg":f"Suspicious extension ({ext})",
                    "detail":"Direct download mat karo."}
    return None

def ck_double_extension(url):
    ul = url.lower()
    if re.search(r"\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif|txt|csv|ppt|pptx)\.(exe|scr|bat|cmd|js|vbs|jar|com|pif|msi|apk)", ul):
        return {"id":"double_extension","level":"critical",
                "msg":"Double extension detected",
                "detail":"report.pdf.exe — asli file executable hai."}
    return None

def ck_data_uri(url):
    if url.lower().startswith("data:"):
        return {"id":"data_uri","level":"critical","msg":"Data URI (data:)",
                "detail":"Inline content — phishing pages aksar use karte."}
    return None

def ck_javascript_uri(url):
    if url.lower().startswith("javascript:"):
        return {"id":"javascript_uri","level":"critical","msg":"JavaScript URI",
                "detail":"Direct code execute karta hai."}
    return None

def ck_percent_encoding(url):
    n = url.count("%")
    if n >= 8:
        return {"id":"percent_encoding","level":"high",
                "msg":f"Bahut percent-encoding ({n})","detail":"URL obfuscated hai."}
    if n >= 4:
        return {"id":"percent_encoding","level":"warn",
                "msg":f"Percent-encoding ({n})","detail":"Kuch chars encoded hain."}
    return None

def ck_double_slash(url):
    if "://" not in url: return None
    after = url.split("://",1)[1]
    if "//" in after:
        return {"id":"double_slash","level":"warn","msg":"Path me '//' hai",
                "detail":"Open redirect attack ka sign."}
    return None

def ck_login_cheap(url):
    ul = url.lower()
    hits = [p for p in LOGIN_PATHS if p in ul]
    if hits and any(x in ul for x in [".tk",".xyz",".ml",".ga",".cf",".gq",".icu",".top",".click"]):
        return {"id":"login_cheap","level":"high",
                "msg":f"Login page sasta TLD pe ({', '.join(hits[:2])})",
                "detail":"Login + free TLD = suspicious."}
    return None

def ck_dangerous_words(url):
    ul = url.lower()
    hits = [w for w in DANGEROUS_WORDS if w in ul]
    if hits:
        return {"id":"dangerous_words","level":"warn",
                "msg":f"Bait words: {', '.join(hits[:3])}",
                "detail":"Free/giveaway/crypto bait — common phishing."}
    return None

def ck_web3_words(url):
    ul = url.lower()
    hits = [w for w in WEB3_WORDS if w in ul]
    if hits:
        return {"id":"web3_words","level":"high",
                "msg":f"Web3/crypto bait: {', '.join(hits[:3])}",
                "detail":"Wallet drainer ka strong sign."}
    return None

def ck_unicode_chars(url):
    h,_ = _host_of(url)
    for ch in h:
        if ord(ch) > 127 and ch not in ".-":
            return {"id":"unicode","level":"high",
                    "msg":"Domain me non-ASCII characters",
                    "detail":"Homograph attack ho sakta hai."}
    return None

def ck_deep_subdomain(url):
    h,_ = _host_of(url)
    if h.count(".") >= 5:
        return {"id":"deep_subdomain","level":"high",
                "msg":"Bahut deep subdomain chain",
                "detail":"Real domain aakhri 2 me chhupi hai."}
    return None

def ck_open_redirect(url):
    if "?" not in url: return None
    q = url.split("?",1)[1].lower()
    if any(p in q for p in ["redirect=","url=","next=","return=","continue=","dest=","target="]):
        if "http" in q:
            return {"id":"open_redirect","level":"high",
                    "msg":"Open redirect parameter",
                    "detail":"Login ke baad kahin aur bhej sakta hai."}
    return None

def ck_base64_like(url):
    if "?" not in url: return None
    q = url.split("?",1)[1]
    for _ in re.findall(r"[A-Za-z0-9+/=]{40,}", q):
        return {"id":"base64_like","level":"warn",
                "msg":"Base64-encoded parameter",
                "detail":"Encoded data — malicious payload chhupa ho sakta hai."}
    return None

def ck_mixed_case(url):
    h,_ = _host_of(url)
    if h and h != h.lower() and h != h.upper():
        if sum(1 for c in h if c.isupper()) > 3:
            return {"id":"mixed_case","level":"low",
                    "msg":"Host me mixed case","detail":"Brand mislead karne ke liye ho sakta hai."}
    return None

def ck_trailing_dot(url):
    h,_ = _host_of(url)
    if h.endswith("."):
        return {"id":"trailing_dot","level":"warn","msg":"Host me trailing dot",
                "detail":"DNS trick — filter bypass."}
    return None

def ck_hex_encoding(url):
    if re.search(r"%[0-9a-fA-F]{2}%[0-9a-fA-F]{2}%[0-9a-fA-F]{2}", url):
        return {"id":"hex_encoding","level":"warn","msg":"Hex-encoded sequence",
                "detail":"URL obfuscation technique."}
    return None

def ck_query_params_many(url):
    if "?" not in url: return None
    n = url.split("?",1)[1].count("&")
    if n > 6:
        return {"id":"query_params_many","level":"warn",
                "msg":f"Bahut query params ({n+1})",
                "detail":"Ek lambi query string — hiding technique."}
    return None

def ck_hash_fragment_redirect(url):
    if "#" not in url: return None
    frag = url.split("#",1)[1]
    if "http" in frag.lower():
        return {"id":"hash_redirect","level":"warn","msg":"Hash me URL",
                "detail":"Fragment-based redirect."}
    return None

def ck_no_path_but_login(url):
    _,p = _host_of(url)
    if p and (not p.path or p.path == "/"):
        ul = url.lower()
        if any(w in ul for w in ["login","signin","verify","account","secure"]):
            return {"id":"login_root","level":"low",
                    "msg":"Login keyword par path root","detail":"Root pe login — suspicious."}
    return None

def ck_digit_in_brand(url):
    h,_ = _host_of(url); hl = h.lower()
    for b in BRANDS:
        if b in hl:
            idx = hl.find(b)
            after = hl[idx+len(b):idx+len(b)+3]
            if after and any(c.isdigit() for c in after):
                return {"id":"digit_in_brand","level":"high",
                        "msg":f"Brand ke baad digit ({b}{after})",
                        "detail":"Brand+digit classic typosquat."}
    return None

def ck_repeated_chars(url):
    h,_ = _host_of(url)
    if re.search(r"(.)\1{3,}", h):
        return {"id":"repeated_chars","level":"warn",
                "msg":"Repeated characters in host","detail":"Pattern phishing me common."}
    return None

def ck_gov_lookalike(url):
    ul = url.lower()
    patterns = ["gov-in.co","gov.in.","gov-in.tk","gov-in.xyz",".gov-","-gov.","govt-","-govt.",
                "incometax-","-incometax","irdai-","-irdai","uidai-","-uidai"]
    for p in patterns:
        if p in ul:
            return {"id":"gov_lookalike","level":"critical",
                    "msg":f"Government lookalike pattern '{p}'",
                    "detail":"Government impersonation ho sakti hai."}
    return None

def ck_bank_lookalike(url):
    ul = url.lower()
    bank_words = ["bank-verify","bank-secure","bank-update","-bank.","bank.","kyc-","-kyc",
                  "netbanking-","net-banking","upi-verify","upi-update"]
    hits = [w for w in bank_words if w in ul]
    if hits:
        return {"id":"bank_lookalike","level":"high",
                "msg":f"Banking lookalike: {', '.join(hits[:2])}",
                "detail":"Banking phishing pattern."}
    return None

def ck_dash_in_brand(url):
    h,_ = _host_of(url); hl = h.lower()
    for b in BRANDS:
        if f"-{b}" in hl or f"{b}-" in hl:
            return {"id":"dash_in_brand","level":"high",
                    "msg":f"Brand ke saath dash ('{b}')","detail":"Brand+hyphen phishing pattern."}
    return None

def ck_multiple_brands(url):
    h,_ = _host_of(url); hl = h.lower()
    found = [b for b in BRANDS if b in hl]
    if len(found) >= 2:
        return {"id":"multiple_brands","level":"high",
                "msg":f"Multiple brands in URL: {', '.join(found[:3])}",
                "detail":"Ek URL me kai brands — confusion trick."}
    return None

def ck_subdomain_of_brand(url):
    h,_ = _host_of(url); hl = h.lower()
    for b in BRANDS:
        if hl.startswith(b+".") and b not in ".".join(hl.split(".")[-2:]):
            return {"id":"subdomain_of_brand","level":"high",
                    "msg":f"Brand as subdomain ('{b}.')","detail":"Brand subdomain = classic phishing."}
    return None

def ck_tld_as_subdomain(url):
    h,_ = _host_of(url)
    parts = h.split(".")
    tlds_in_path = {"com","org","net","gov","edu","co","io"}
    for p in parts[:-1]:
        if p in tlds_in_path and len(parts) > 2:
            return {"id":"tld_as_subdomain","level":"warn",
                    "msg":f"TLD jaisa subdomain ('{p}')","detail":"com.evil.com jaisa trick."}
    return None

def ck_creds_in_url(url):
    ul = url.lower()
    if any(w in ul for w in ["password=","passwd=","pwd=","token=","apikey=","api_key=","secret="]):
        return {"id":"creds_in_url","level":"critical",
                "msg":"URL me credentials/token","detail":"Sensitive data URL me — never do this."}
    return None

def ck_http_port_alt(url):
    _,p = _host_of(url)
    if p and p.port == 8080:
        ul = url.lower()
        if any(w in ul for w in ["login","secure","bank","verify","signin"]):
            return {"id":"http_port_alt","level":"warn",
                    "msg":"Login on port 8080","detail":"Dev port pe login — suspicious."}
    return None

def ck_email_like_host(url):
    h,_ = _host_of(url)
    if "@" in h:
        return {"id":"email_host","level":"critical",
                "msg":"Host me email jaisa structure","detail":"Credentials @ trick."}
    return None


ALL_CHECKS = [
    ck_protocol, ck_no_scheme, ck_cheap_tld, ck_brand_subdomain, ck_hyphens,
    ck_homograph, ck_urgency, ck_ip_url, ck_at_symbol, ck_shortener, ck_port,
    ck_long_url, ck_punycode, ck_typosquat, ck_many_subdomains, ck_suspicious_ext,
    ck_double_extension, ck_data_uri, ck_javascript_uri, ck_percent_encoding,
    ck_double_slash, ck_login_cheap, ck_dangerous_words, ck_web3_words,
    ck_unicode_chars, ck_deep_subdomain, ck_open_redirect, ck_base64_like,
    ck_mixed_case, ck_trailing_dot, ck_hex_encoding, ck_query_params_many,
    ck_hash_fragment_redirect, ck_no_path_but_login, ck_digit_in_brand,
    ck_repeated_chars, ck_gov_lookalike, ck_bank_lookalike, ck_dash_in_brand,
    ck_multiple_brands, ck_subdomain_of_brand, ck_tld_as_subdomain,
    ck_creds_in_url, ck_http_port_alt, ck_email_like_host,
]


def detect(url):
    if not url or not isinstance(url, str):
        return {"url":"","risk":0,"verdict":"UNKNOWN","color":"green",
                "findings":[],"host":""}
    findings = []
    for ck in ALL_CHECKS:
        try:
            r = ck(url)
            if r: findings.append(r)
        except Exception:
            pass
    score = 0
    for f in findings:
        score += {"low":5,"warn":15,"high":30,"critical":50}[f["level"]]
    score = min(score, 100)
    if score == 0: v,c = "SAFE","green"
    elif score < 25: v,c = "SUSPICIOUS","yellow"
    elif score < 60: v,c = "LIKELY PHISHING","orange"
    else: v,c = "PHISHING","red"
    return {"url":url,"risk":score,"verdict":v,"color":c,
            "findings":findings,"host":_host_of(url)[0]}
