{ pkgs, ... }:

{
  env.REFINE_NO_TELEMETRY = true;

  packages = with pkgs; [
    nodePackages.pnpm
    nodePackages.typescript-language-server
  ];

  languages.javascript.enable = true;
}
