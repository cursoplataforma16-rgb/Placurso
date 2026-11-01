from pathlib import Path
import re
import sys

MARKER = "\n/* PLACURSO_AADS_UNIT_2459988 */\n"
AADS_UNIT = r'''<!-- BEGIN AADS AD UNIT 2459988 -->

<div style="position: absolute; z-index: 99999">
      <input autocomplete="off" type="checkbox" id="aadsstickymvxmffhg" hidden />
      <div style="padding-top: auto; padding-bottom: 0;">
        <div style="width:100%;height:auto;position:fixed;text-align:center;font-size:0;top:0;left:0;right:0;margin:auto">
          <label for="aadsstickymvxmffhg" style="top: 50%;transform: translateY(-50%);right:24px;; position: absolute;border-radius: 4px; background: rgba(248, 248, 249, 0.70); padding: 4px;z-index: 99999;cursor:pointer">
            <svg fill="#000000" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490">
              <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/>
            </svg>
          </label>
          <div id="frame" style="width: 100%;margin: auto;position: relative; z-index: 99998;">
                      <iframe data-aa=2459988 src=//acceptable.a-ads.com/2459988/?size=Adaptive style='border:0; padding:0; width:70%; height:auto; overflow:hidden; margin: auto'></iframe>
                      <div style="width: 70%;margin:auto;text-align: left;position: absolute;left: 0;right: 0">
                        <a style="display:inline-block;font-size: 13px;color: #263238;padding: 4px 10px;background: #F8F8F9;text-decoration: none; border-radius: 0 0 4px 4px;"
                          id="frame-link"
                          target="_blank"
                          href="https://aads.com/campaigns/new?source_id=2459988&source_type=ad_unit&partner=2459988">
                          Advertise here
                        </a>
                      </div>
                  </div>
        </div>
        <style>
      #aadsstickymvxmffhg:checked + div {
        display: none;
      }
    </style>
    </div></div>

<!-- END AADS AD UNIT 2459988 -->'''


def patch(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if MARKER in text:
        raise SystemExit("ERRO: A-Ads unit 2459988 já foi integrado.")

    block_pattern = re.compile(
        r"<!-- BEGIN AADS AD UNIT\s+\d+\s*-->.*?<!-- END AADS AD UNIT\s+\d+\s*-->",
        re.IGNORECASE | re.DOTALL,
    )
    match = block_pattern.search(text)
    if match:
        text = text[:match.start()] + AADS_UNIT + text[match.end():]
        action = "substituído"
    else:
        text = text.rstrip() + "\n\n" + AADS_UNIT + "\n"
        action = "adicionado"

    text += MARKER
    path.write_text(text, encoding="utf-8")
    print(f"OK: bloco A-Ads 2459988 {action}; unidade exata preservada.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("psico-engine.js")
    if not target.is_file():
        raise SystemExit(f"ERRO: ficheiro alvo não encontrado: {target}")
    patch(target)
