import {AbstractAppService} from "../../../shared/abstracts/abstract.app.service";
import {Injectable} from "@angular/core";

@Injectable({ providedIn: 'root' })
export class UserWorkerService extends AbstractAppService {

    constructor() {
        super();
    }

}
