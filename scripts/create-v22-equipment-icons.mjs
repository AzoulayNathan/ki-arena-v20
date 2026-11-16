import fs from'node:fs';const paths={
rifle:'M24 102H167L182 111H222V124H150L134 141H112L95 188H73L83 140H46L30 157H13L30 125Z M55 91H149 M84 83H126V102 M160 112V126 M119 136 112 155H129L139 137',
assault:'M12 104H57V95H175V106H220V119H169L158 133H139L147 163H125L117 139H94L83 181H62L68 138H48L28 151H12Z M73 89H154 M97 72H131V95 M40 105V137 M183 103V120',
blaster:'M34 83H155L171 96H208V121H143L120 142H102L91 185H61L73 130H40Z M50 97H155 M174 92V127 M65 74H122V84 M164 106H198',
armor:'M64 43 85 31 105 46H135L155 31 176 43 185 89 160 102 151 179Q120 196 89 179L80 102 55 89Z M90 72H150 M88 102H152 M91 135H149',
heal:'M96 36H144V79H187V127H144V170H96V127H53V79H96Z',
star:'M120 28 132 89 191 71 151 119 191 168 131 151 120 213 108 151 49 168 89 119 49 71 109 89Z M120 101A18 18 0 1 0 120 137A18 18 0 1 0 120 101',
gun:'M44 76H163L183 90 210 90V115H138L127 133H103L94 183H66L72 124 44 117Z M55 90H170 M102 128H123L117 146H99',
blade:'M73 163 165 39 184 27 187 48 93 180Z M62 154 103 188 M74 175 52 207 39 198 63 167',
staff:'M48 195 175 40 185 49 58 205Z M41 185 61 202 M161 49 181 66 M72 162 89 177 M128 93 145 109',
orb:'M120 51A68 68 0 1 0 120 187A68 68 0 1 0 120 51 M82 77Q51 137 109 159 M120 51V35L143 24 159 38 M143 24V13',
tool:'M56 49H134L177 81V131H145L132 156H80L66 129H45V71Z M63 75H135V120H63Z M103 86A12 12 0 1 0 103 110A12 12 0 1 0 103 86 M159 90H185V117H159',
weapon:'M70 182 162 58 179 44 190 58 178 77 87 195Z M60 165 99 196 M64 190 46 212 33 201 53 178'};fs.mkdirSync('assets/v22/equipment',{recursive:true});for(const [name,d]of Object.entries(paths))fs.writeFileSync('assets/v22/equipment/'+name+'.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 240 320"><defs><radialGradient id="bg"><stop stop-color="#3a7181"/><stop offset="1" stop-color="#112d3d"/></radialGradient><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#fff5ce"/><stop offset=".55" stop-color="#80d7d4"/><stop offset="1" stop-color="#3f9dab"/></linearGradient></defs><path fill="url(#bg)" d="M0 0H240V320H0Z"/><circle cx="120" cy="130" r="92" fill="none" stroke="#9bd9cd" stroke-opacity=".2"/><path d="M18 130H222 M120 28V232" stroke="#98d6d6" stroke-opacity=".12"/><g transform="translate(0 22)"><path d="${d}" fill="#4c899440" stroke="#06283b" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="#193e4e" stroke="url(#metal)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`);console.log(Object.keys(paths).length+' category pictograms');
