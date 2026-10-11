# Auditoria do vídeo de marca — 11/10/2026

O arquivo final [vetor-urbano-15s.mp4](../videos/vetor-urbano-motion/renders/vetor-urbano-15s.mp4) foi preservado exatamente como encontrado, sem nova renderização.

## Evidência executada nesta consolidação

- `ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels -of json videos/vetor-urbano-motion/renders/vetor-urbano-15s.mp4`: 15,000 s; H.264; 1920 × 1080; 30/1 fps; 450 quadros; AAC estéreo, 48 kHz.
- `ffmpeg -v error -i videos/vetor-urbano-motion/renders/vetor-urbano-15s.mp4 -f null -`: decodificação completa, retorno 0, sem erros.
- Brief, metadados, template, scripts existentes, MP4, `ffprobe.json` e imagem de prova preservados. O arquivo `ffprobe.json` é evidência anterior; a inspeção acima foi executada novamente.

## Divergência e limite

O `PLAN.md` anterior afirmava a entrega de `compositions/index.html`, `shot-plan.json`, `verification.md`, `assets/index.md` e fontes/áudio locais. Esses arquivos não estavam presentes no inventário da consolidação; as pastas correspondentes estavam vazias. `videos/vetor-urbano-motion/index.html` contém o template inicial “Title”, com duração de 10 s, e **não reproduz o filme de 15 s**.

Os scripts HyperFrames presentes referem-se à versão 0.8.148, mas executar `render` sobre o template não reconstrói o MP4 entregue. A reedição/reprodução está bloqueada até recuperar os fontes finais e suas licenças. Não se declara check ou renderização da composição final nesta tarefa. O MP4 íntegro e o brief foram mantidos; nenhum conteúdo novo foi criado. Caches de ferramentas, thumbnails e ambientes locais não são parte do projeto versionado.
