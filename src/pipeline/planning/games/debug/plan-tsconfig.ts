import * as path from "path"
import Diff from "../../../files/diff"
import StepBase from "../../../steps/step-base"
import ParallelStep from "../../../steps/aggregators/parallel-step"
import DeleteStep from "../../../steps/actions/files/delete-step"
import WriteFileStep from "../../../steps/actions/files/write-file-step"
import tsconfigContent from "../../../steps/actions/type-script/tsconfig-content"

export default function (
  games: Diff<string>
): StepBase {
  const additions: ReadonlyArray<StepBase> = games
    .added
    .map(game => new WriteFileStep(
      () => JSON.stringify({
        include: [
          path.join(`src`, `.declarations.ts`),
          path.join(`src`, `**`, `*.ts`),
          path.join(`..`, `..`, `engine`, `src`, `**`, `*.ts`)
        ],
        exclude: [
          path.join(`..`, `..`, `engine`, `src`, `**`, `*.d.ts`)
        ],
        compilerOptions: tsconfigContent
      }),
      path.join(`src`, `games`, game, `tsconfig.json`)
    ))

  const deletions: ReadonlyArray<StepBase> = games
    .deleted
    .map(game => new DeleteStep(
      path.join(`src`, `games`, game, `tsconfig.json`))
    )

  return new ParallelStep(
    `tsconfig`,
    additions.concat(deletions)
  )
}
