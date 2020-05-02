import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import ParallelStep from "../../steps/aggregators/parallel-step"
import SerialStep from "../../steps/aggregators/serial-step"
import separateByType from "./common/separate-by-type"
import planCreationOfTemporaryDirectories from "./debug/plan-creation-of-temporary-directories"
import planGeneratedTypeScript from "./common/plan-generated-type-script"
import planTypeScript from "./common/plan-type-script"
import planSvg from "./common/plan-svg"
import planSvgCombination from "./common/plan-svg-combination"
import planJavascriptGeneration from "./plan-javascript-generation"
import planHtmlGeneration from "./plan-html-generation"
import planTsconfig from "./debug/plan-tsconfig"
import planDeletionOfTemporaryDirectories from "./debug/plan-creation-of-temporary-directories"

export default function (
  debug: boolean,
  enginePlanningResult: types.EnginePlanningResult,
  gamesDiff: Diff<types.GameFile>
): StepBase {
  const typeSeparated = separateByType(debug, gamesDiff)
  const games = typeSeparated.allSorted
    .mapItems(item => item.game)
    .deduplicateItems()
  const creationOfTemporaryDirectoriesSteps = planCreationOfTemporaryDirectories(games)
  const generatedTypeScriptSteps = planGeneratedTypeScript(typeSeparated.sortedByKey.metadata)
  const typeScriptSteps = planTypeScript(typeSeparated.sortedByKey.typeScript)
  const svgSteps = planSvg(typeSeparated.sortedByKey.svg)
  const svgCombinationSteps = planSvgCombination(typeSeparated.sortedByKey.svg)
  const javaScriptSteps = planJavascriptGeneration(
    debug, enginePlanningResult, typeSeparated.allSorted
  )
  const htmlGenerationSteps = planHtmlGeneration(
    debug, enginePlanningResult, games
  )
  const tsconfigSteps = planTsconfig(games)
  const deletionOfTemporaryDirectoriesSteps = planDeletionOfTemporaryDirectories(games)

  return new SerialStep(
    `games`,
    [
      creationOfTemporaryDirectoriesSteps,
      tsconfigSteps,
      new ParallelStep(
        `files`,
        [generatedTypeScriptSteps, typeScriptSteps, svgSteps]
      ),
      svgCombinationSteps,
      javaScriptSteps,
      htmlGenerationSteps,
      deletionOfTemporaryDirectoriesSteps,
    ]
  )
}
