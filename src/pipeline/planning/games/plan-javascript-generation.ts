import * as path from "path"
import * as typeScript from "typescript"
import keyValueObject from "../../utilities/key-value-object"
import * as types from "../../types"
import Diff from "../../files/diff"
import StepBase from "../../steps/step-base"
import DeleteFromKeyValueStoreIfSetStep from "../../steps/actions/stores/delete-from-key-value-store-if-set-step"
import CombineTypeScriptStep from "../../steps/actions/type-script/combine-type-script-step"
import MinifyJsStep from "../../steps/actions/minify-js-step"
import gameNameTypeScriptParsedStore from "../../stores/game-metadata-type-script-parsed-store"
import gameTypeScriptCombinedJavascriptTextProductionStore from "../../stores/game-type-script-combined-javascript-text-production-store"
import gameJavascriptProductionStore from "../../stores/game-javascript-production-store"
import gameSvgTypeScriptParsedStore from "../../stores/game-svg-type-script-parsed-store"
import engineTypeScriptParsedStore from "../../stores/engine-type-script-parsed-store"
import gameTypeScriptParsedStore from "../../stores/game-type-script-parsed-store"

export default function (
  enginePlanningResult: types.EnginePlanningResult,
  allSorted: Diff<types.GameFile>
): StepBase {
  return allSorted
    .mapItems(item => item.game)
    .deduplicateItems()
    .generateSteps(
      `javascriptGeneration`,
      enginePlanningResult.allGamesRequireJavascriptRegeneration,
      item => item,
      item => [
        new DeleteFromKeyValueStoreIfSetStep(
          gameTypeScriptCombinedJavascriptTextProductionStore, item
        ),
        new DeleteFromKeyValueStoreIfSetStep(gameJavascriptProductionStore, item)
      ],
      item => [
        new CombineTypeScriptStep(
          () => {
            const allEngineTypeScript = engineTypeScriptParsedStore.getAll()
            const nonPlaceholderEngineTypeScript: { [key: string]: typeScript.SourceFile } = {}
            for (const key of Object
              .keys(allEngineTypeScript)
              .filter(key => !key.endsWith(`.d.ts`))) {
              nonPlaceholderEngineTypeScript[key] = allEngineTypeScript[key]
            }
            return [
              nonPlaceholderEngineTypeScript,
              keyValueObject(
                path.join(`.generated-type-script`, `metadata.ts`),
                gameNameTypeScriptParsedStore.get(item)
              ),
              keyValueObject(
                path.join(`.generated-type-script`, `svg.ts`),
                gameSvgTypeScriptParsedStore.get(item)
              ),
              gameTypeScriptParsedStore.tryGetAllByBaseKey(item)
            ]
          },
          javascript => gameTypeScriptCombinedJavascriptTextProductionStore.set(
            item, javascript
          ),
        ),
        new MinifyJsStep(
          () => gameTypeScriptCombinedJavascriptTextProductionStore.get(item),
          combined => gameJavascriptProductionStore.set(item, combined)
        ),
      ]
    )
}
