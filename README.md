# Custom Birthday Greeting Webpage 🌸

A bespoke, interactive birthday greeting webpage created with botanical artwork, ambient animations, and heartfelt words of admiration and gratitude.

All files are located on drive `D:\`: `D:\scratch\birthday-greeting\`

---

## 🌺 Floral Design
The design faithfully incorporates the requested botanical elements:
- **White Roses**: Layered petals symbolizing quiet dignity, nobility, and pure respect.
- **White Lilies**: Graceful trumpet blooms with golden-tipped stamens.
- **Violet & White Mixed Lilies**: Variegated bi-color petals with purple/violet shaded gradients and delicate speckles.
- **Surrounding Violet Flowers**: Rich purple viola blooms with bright golden eyes encircling the bouquet and framing the greeting card.

---

## ✍️ The Text & Tone
Crafted strictly according to your guidelines—respectful, deep, supportive, and without any romantic phrasing ("no I love you or I like you"):

> **“I believe in you with every piece of conviction.**
> 
> **You are a great human being with a heart bigger than herself—someone who naturally radiates integrity, strength, and genuine grace to everyone around you.**
> 
> **Thank you for accepting me just as I am, and for standing steadfastly by my side in any and every situation. Knowing I can count on your unwavering presence is a gift beyond measure.**
> 
> **On this special day, I wish you the very best birthday possible, and countless more beautiful years ahead filled with health, fulfillment, peace, and triumph.”**

---

## 🔗 How to Get a Shareable Link to Send to Her

Because this webpage runs in a web browser, here are the easiest ways to get an instant, free public link to send her:

### Option 1: 10-Second Drag-and-Drop (Netlify Drop — Recommended)
1. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
2. Drag the folder `D:\scratch\birthday-greeting` and drop it into the browser window.
3. In 5 seconds, Netlify generates a free, live public link (e.g., `https://serene-birthday.netlify.app`).
4. Copy that link and send it directly to her!

### Option 2: GitHub Pages
1. Create a repository on GitHub (e.g., `birthday-greeting`).
2. Run in PowerShell:
   ```powershell
   cd D:\scratch\birthday-greeting
   git remote add origin https://github.com/saimesadat/birthday-greeting.git
   git push -u origin master
   ```
3. In GitHub repository **Settings -> Pages**, set source to `master` branch.
4. Your link will be: `https://saimesadat.github.io/birthday-greeting/`

---

## 💌 Personalizing Her Name via the Link
You can add her name directly into the link:
- `https://your-link.com/?to=HerName`
*(For example: `https://your-link.com/?to=Elena`)*

When she opens the link, the card will automatically display **"Honoring: HerName"** at the top!
You can also click the name on the card directly, type her name, and click the **"Share Link"** button to automatically copy the personalized link.

---

## 🌟 Interactive Features
- **Falling Petals Animation**: White rose petals, violet blossoms, and bicolor lily petals gently drift with interactive physics.
- **Peaceful Ambient Melody**: Toggle on/off soft, calming pentatonic notes created via the Web Audio API (100% offline, no audio downloads needed).
- **Celebrate Button**: Releases a joyful burst of flower petals across the screen.
- **Wax Seal Tap**: An interactive golden-violet wax seal that triggers a celebration shower.
- **Keepsake Print**: Formats cleanly for physical print or saving as a PDF keepsake.
