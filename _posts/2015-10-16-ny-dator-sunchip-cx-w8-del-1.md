---
layout: post
title:  "Ny dator, Sunchip CX-W8: del 1"
categories:
- datanörd
---

Att få en ny dator att pilla med kan ju vara lite småkul, sådär. :smile: Igår så hade jag fått ett paket på posten. Innehållet var en "Wintel Mini PC" som den kallades på eBay, men vid närmare efterforskningar verkade det vara en [CX-W8 från Sunchip](http://sunchip-tech.en.alibaba.com/product/60117269282-800783329/Intel_Bay_Trail_T_Atom_Z3735F_Box_CX_W8_mini_pc_TV_BOX_2G_DDR_32G_Emmc.html). Marknadsfördes dock på sedvanligt kinesiskt vis under mer no-name former... :smile:

Lite bilder är ju alltid trevligt:

![CX-W8](/images/cx-w8-bild1.jpg)

![CX-W8](/images/cx-w8-bild2.jpg)

![CX-W8](/images/cx-w8-bild3.jpg)

![CX-W8](/images/cx-w8-bild4.jpg)

Storleken på denna är alltså i stil med en Apple TV; praktiskt taget identisk formfaktor. Men till ett pris på under $100 (plus moms) så får man alltså en komplett mini PC, med nedanstående specar, som är fullt användbar med Windows 8.1 och Linux. Känns ju faktiskt helt OK måste jag säga.

- CPU: Intel Baytrail-T CR(Quad-core) 1.33GHz. (Finns TurboBoost upp till 1.83 GHz eller något sådant tror jag. När burken idlar så går den ner till ca 500 MHz för att spara ström.)
- GPU: Intel HD Graphics
- RAM: 2 GiB DDR3L
- ROM Flash: Nand Flash 32 GiB.
- Network: 100 Mbit Ethernet
- Wifi: WIFI 802.11b/g/n
- Bluetooth: 4.0
- USB: 2 x USB 2.0
- HDMI: Audio/video-output (audio tycks dock tyvärr endast funka under Windows, enl. uppgift).
- Power: 5V/3A.

En riktigt liten, tyst (helt fläktlös), strömsnål PC. Vad passar bättre med en sådan än att installera Linux, kan man ju fråga sig? :smiley:

Självklart kan fläktlösheten ha en baksida om man kör väldigt CPU-tunga grejer (i form av överhettning och CPU-throttling som det medför). Men, för mitt use case så *hoppas* jag att jag kommer klara mig från det.

Så här långt har jag kommit hittills:

## Dag 1

1. Testade Windows, lattjade lite allmänt. Provade surfa lite, spela upp klipp från SVT Play etc. Kändes först lite seg (t.ex. när man startar upp Internet Explorer) och videouppspelning laggade. Men, efter att ha switchat över från wifi till Ethernet blev det betydligt stabilare nätuppkoppling.

## Dag 2

2. Konstaterade att Windows 8.1 inte är aktiverat, så jag kontaktade försäljaren på eBay för att få det fixat. Visserligen kommer jag just nu köra Linux på den men det är ju en principsak; säljs den som en "Windows 8.1-PC" så vill man ha en giltig licens som funkar att aktivera Windows med.

3. Brände ut en Debian-installation på ett USB-minne, på en annan dator.

4. Försökte lyckas boota up Linux-installationen utan tangentbord. Visade sig lättare sagt än gjort. :smile:

## Dag 3

5. Lånade ett USB-tangentbord från jobbet, med vilket jag lyckades komma åt bootmenyn. Linuxinstallationen lyckades dock ej boota, troligen pga 32-bitars UEFI.

6. Flashade om datorn med 64-bitars UEFI som jag hittade [här](http://www.cnx-software.com/2015/04/29/how-to-install-64-bit-bios-on-sunchip-cx-w8-unbricking-method/). Kändes lite riskabelt (fanns ju en viss risk att "bricka" min nya, fina PC) men det funkade bra, och det tycks ha funnits någon form av säkerhetscheck i flash-programvaran som kollade att det faktiskt är rätt hårdvara innan den flashade in den nya UEFI-imagen. :smile:

7. Bootade om med Linux-installationen igen. Den här gången gick det mycket, mycket bättre!

8. Installerade Linux och bootade upp maskinen med det. Tycks funka helt OK, frånsett att "någonting" gör att text-output buggar. De översta raderna funkar bra, men om man fyller hela skärmen med text (t.ex. genom att köra `top`) så ser det helt mysko ut. Troligen en bugg antingen i UEFI-textmode-implementationen, eller i Linux-kerneln (vilket nästan känns mindre troligt i detta fall). Detta är dock inget stort problem för mig nu, eftersom jag kommer köra det som en headless ssh-server så jag tror jag väljer att ignorera det för stunden.

Så... då återstår bra att sätta upp allt som ska köra på den:

- nginx
- postfix
- PowerDNS
- säkert något mer som jag glömt nu.

Tänkte även testa med att köra [etckeeper](https://github.com/joeyh/etckeeper) på den här servern nu. Tycker idén med en persistent `/etc` &mdash; säkert backupad på en git-server någonstans &mdash; är trevlig. Konfigurationen till diverse program är ju en av de mer värdefulla grejerna man har på en dator, tillsammans med användardata såsom källkod till webbsidor och liknande (och sådant har jag ju redan oftast i `git`), enligt min mening.
