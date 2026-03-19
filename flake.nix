{
  description = "Savings Grid — React SPA dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        # `nix develop` — provides node 20 + npm
        devShells.default = pkgs.mkShell {
          buildInputs = [ pkgs.nodejs_20 ];
          shellHook = ''
            echo "Node $(node --version) | npm $(npm --version)"
            echo "Run: npm install && npm run dev"
          '';
        };

        # `nix build` — reproducible production build
        # IMPORTANT: after `npm install`, run:
        #   nix run nixpkgs#prefetch-npm-deps -- package-lock.json
        # and replace the hash below.
        packages.default = pkgs.buildNpmPackage {
          pname = "savings-grid";
          version = "1.0.0";
          src = ./.;
          npmDepsHash = "sha256-4xdUtNeKkXAahln4usFd4zmmMai1t7TyPbl4D+ySlfg=";
          # Pass base URL from environment; falls back to "/" for local nix build
          VITE_BASE_URL = builtins.getEnv "VITE_BASE_URL";
          buildPhase = "npm run build";
          installPhase = "cp -r dist/. $out/";
        };
      }
    );
}
