import shell from "shelljs";
import path from "path";

export default async (glob: string, filename: string) => {
  const cmd = [
    path.join(process.cwd(), "node_modules", ".bin", "formatjs"),
    "extract",
    `"${glob}"`,
    "--out-file",
    `"${filename}"`,
    "--format",
    "crowdin",
  ];

  const { stderr } = shell.exec(cmd.join(" "));

  if (stderr) {
    throw new Error(stderr);
  }
};
