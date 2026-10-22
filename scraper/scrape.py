"""
Showroom scraper - school project (data source: automobile.tn).

Three modes:
  python scrape.py inspect <url>    -> look at ONE page and show what the script finds
  python scrape.py discover <url>   -> list the car page links found on a brand/model page
  python scrape.py                  -> scrape every URL in CARS and write ../public/cars.json
"""
import json
import os
import random
import re
import sys
import time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

# ------------------------------------------------------------------
# 1) SETTINGS  (the only part you edit)
# ------------------------------------------------------------------
# Paste the car pages here, one URL per line. Brand and model are read from the URL.
CARS = [
     "https://www.automobile.tn/fr/neuf/audi/a3-sportback/35-tfsi-tech-line",
    "https://www.automobile.tn/fr/neuf/audi/a3-berline/35-tfsi-dynamic-edition",
    "https://www.automobile.tn/fr/neuf/audi/q2/35-tfsi-bva-black-limited",
    "https://www.automobile.tn/fr/neuf/audi/q3/tfsi-s-tronic-advanced-line",
    "https://www.automobile.tn/fr/neuf/audi/q3-sportback/tfsi-s-tronic-s-line",
    "https://www.automobile.tn/fr/neuf/audi/a5-berline/tfsi-advanced",
    "https://www.automobile.tn/fr/neuf/audi/a6-sportback-e-tron/100-kwh-performance",
    "https://www.automobile.tn/fr/neuf/audi/q6-e-tron/100-kwh-quattro-s-line",
    "https://www.automobile.tn/fr/neuf/audi/q6-sportback-e-tron/100-kwh-quattro-s-line",
    "https://www.automobile.tn/fr/neuf/audi/q8/55-tfsi-tiptronic-quattro-2025",
     "https://www.automobile.tn/fr/neuf/jac/t8-double-cabine/2.0-l-cti-diesel",
    "https://www.automobile.tn/fr/neuf/jac/t8-dc/2.0-l-cti-diesel-4x4",
    "https://www.automobile.tn/fr/neuf/jac/t9/2.0-l-cti-diesel-bva",
]

POWER_MODE = "fiscal"      # "fiscal" -> small numbers like 9 (same as your current data)
                           # "hp"     -> real horsepower like 163
START_ID = 17              # your hard-coded list in app.ts ends at id 16
DOWNLOAD_IMAGES = True     # False = do not download photos
DELAY_SECONDS = 2          # pause between two requests = polite
OUTPUT_JSON = os.path.join("..", "public", "cars.json")
IMAGES_DIR = os.path.join("..", "public", "images")

# An honest label: we say who we are. Never pretend to be another bot.
HEADERS = {"User-Agent": "student-project-showroom (school project; contact: jaidimeriem484@gmail.com"}


# ------------------------------------------------------------------
# 2) SMALL TOOLS
# ------------------------------------------------------------------
def download_html(url):
    """Ask the server for the page and return the HTML text."""
    response = requests.get(url, headers=HEADERS, timeout=20)
    response.raise_for_status()          # stops with an error if the page is 404/500...
    return response.text


def clean(text):
    return re.sub(r"\s+", " ", text.replace("\u00a0", " ")).strip()


def get_meta(soup, name):
    tag = soup.find("meta", attrs={"property": name}) or soup.find("meta", attrs={"name": name})
    return clean(tag["content"]) if tag and tag.get("content") else ""


def find_price_thousands(text):
    """First price like '135 000 DT' -> 135 (your data stores prices in thousands)."""
    for m in re.finditer(r"(\d{1,3}(?:[\s\u00a0\u202f.]\d{3})+|\d{4,7})\s*(?:DT|TND|dinars?)", text, re.I):
        value = int(re.sub(r"\D", "", m.group(1)))
        if value >= 10000:               # ignore small amounts (fees, taxes...)
            return round(value / 1000)
    return None


def read_specs(soup):
    """The 'Fiche technique' tables: every row with 2 cells = (label, value)."""
    specs = {}
    for row in soup.find_all("tr"):
        cells = row.find_all(["td", "th"])
        if len(cells) == 2:
            label, value = clean(cells[0].get_text(" ")), clean(cells[1].get_text(" "))
            if label and value and label not in specs:
                specs[label] = value
    return specs


def first_number(value):
    m = re.search(r"\d+", value or "")
    return int(m.group()) if m else None


def find_power(specs, text):
    if POWER_MODE == "fiscal":
        n = first_number(specs.get("Puissance fiscale"))
        if n is None:
            m = re.search(r"puissance\s+fiscale\D{0,15}?(\d{1,2})\s*cv", text, re.I)
            n = int(m.group(1)) if m else None
    else:
        n = first_number(specs.get("Puissance (ch.din)"))
        if n is None:
            m = re.search(r"puissance\s*\(ch\.?din\)\D{0,10}?(\d{2,4})", text, re.I)
            n = int(m.group(1)) if m else None
    return n


def build_description(full_name, specs):
    """The page has no real description, so we write one from the spec table."""
    wanted = ["Carrosserie", "Energie", "Puissance (ch.din)", "Puissance fiscale", "Boîte",
              "Transmission", "Nombre de places", "Garantie", "Consommation mixte"]
    parts = [f"{k} : {specs[k]}" for k in wanted if k in specs]
    if not parts:
        return ""
    return f"{full_name}. " + " ; ".join(parts) + "."


def brand_names_from_menu(soup):
    """The menu lists every brand: link /fr/neuf/<slug> + display name (e.g. great-wall -> GWM)."""
    names = {}
    for a in soup.find_all("a", href=True):
        m = re.fullmatch(r"(?:https://www\.automobile\.tn)?/fr/neuf/([a-z0-9-]+)", a["href"])
        if m and a.get_text(strip=True) and m.group(1) not in ("electrique", "comparateur", "concessionnaires"):
            names.setdefault(m.group(1), clean(a.get_text()))
    return names


def slug_to_title(slug):
    return slug.replace("-", " ").title()


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def save_image(image_url, slug):
    ext = os.path.splitext(image_url.split("?")[0])[1].lower() or ".jpg"
    filename = slug + ext
    os.makedirs(IMAGES_DIR, exist_ok=True)
    r = requests.get(image_url, headers=HEADERS, timeout=20)
    r.raise_for_status()
    with open(os.path.join(IMAGES_DIR, filename), "wb") as f:
        f.write(r.content)
    return filename


def extract_car(html, url):
    """One HTML page -> one dictionary shaped like your Auto interface."""
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    specs = read_specs(soup)

    # /fr/neuf/<brand-slug>/<model-slug>/<version-slug>
    parts = [p for p in urlparse(url).path.split("/") if p]
    brand_slug, model_slug = parts[2], parts[3]
    brand = brand_names_from_menu(soup).get(brand_slug, slug_to_title(brand_slug))
    model = slug_to_title(model_slug)

    # og:title looks like: "Prix JAC T9 2.0 L CTI Diesel BVA neuve - 135 000 DT"
    og_title = get_meta(soup, "og:title")
    full_name = re.sub(r"^Prix\s+|\s+neuve.*$", "", og_title).strip() or f"{brand} {model}"

    price = find_price_thousands(og_title) or find_price_thousands(text)
    return {
        "brand": brand,
        "model": model,
        "full_name": full_name,
        "price": price,
        "power": find_power(specs, text),
        "image_url": get_meta(soup, "og:image"),
        "description": build_description(full_name, specs),
        "specs_found": len(specs),
    }


# ------------------------------------------------------------------
# 3) MODE "inspect"
# ------------------------------------------------------------------
def inspect(url):
    html = download_html(url)
    with open("page.html", "w", encoding="utf-8") as f:
        f.write(html)
    car = extract_car(html, url)
    print("HTML size   :", len(html), "characters (saved in page.html)")
    for key in ("brand", "model", "full_name", "price", "power", "image_url", "specs_found", "description"):
        print(f"{key:12}:", car[key])
    if car["specs_found"] == 0:
        print("WARNING: no spec table found -> paste me the output so I can adjust.")


# ------------------------------------------------------------------
# 4) MODE "discover": list car links on a brand / model page
# ------------------------------------------------------------------
def discover(url):
    html = download_html(url)
    soup = BeautifulSoup(html, "html.parser")
    base_parts = [p for p in urlparse(url).path.split("/") if p]
    found = []
    for a in soup.find_all("a", href=True):
        full = urljoin("https://www.automobile.tn", a["href"]).split("#")[0].split("?")[0]
        path = [p for p in urlparse(full).path.split("/") if p]
        # a car page = /fr/neuf/<brand>/<model>/<version>, in the same brand as the page we read
        if len(path) == 5 and path[:3] == base_parts[:3] and full not in found and not full.endswith(("/devis", "/financement")):
            found.append(full)
    print(f"{len(found)} car page(s) found. Copy the ones you want into CARS:\n")
    for link in found:
        print(f'    "{link}",')


# ------------------------------------------------------------------
# 5) MODE "scrape"
# ------------------------------------------------------------------
def scrape_all():
    results, next_id = [], START_ID
    for url in CARS:
        print("->", url, end=" ... ")
        try:
            car = extract_car(download_html(url), url)
        except Exception as error:
            print("FAILED:", error)
            time.sleep(DELAY_SECONDS)
            continue
        missing = [k for k in ("price", "power", "description") if not car[k]]
        if missing:
            print("skipped, missing:", missing, "(run inspect on this URL)")
            time.sleep(DELAY_SECONDS)
            continue

        photo = ""
        if DOWNLOAD_IMAGES and car["image_url"]:
            try:
                photo = save_image(car["image_url"], slugify(car["full_name"]))
            except Exception as error:
                print("(photo failed:", error, ")", end=" ")

        results.append({
            "id": next_id,
            "brand": car["brand"],
            "model": car["model"],
            "price": car["price"],
            "power": car["power"],
            "photo": photo,
            "availability": random.randint(2, 12),   # the site has no stock number: demo value
            "description": car["description"],
        })
        next_id += 1
        print("OK:", car["full_name"])
        time.sleep(DELAY_SECONDS)

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\nDone: {len(results)} cars written to {OUTPUT_JSON}")


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "inspect":
        inspect(sys.argv[2])
    elif len(sys.argv) >= 3 and sys.argv[1] == "discover":
        discover(sys.argv[2])
    else:
        scrape_all()