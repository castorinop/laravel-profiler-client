import Binding from './binding';
import Application from './application';
import { trackerService } from './../services/tracker.model.service';

export default class Tracker {
    constructor(data) {
        this.executionAt = trackerService.executionAt(data.meta.execution_at);
        this.id = data.meta.id;
        this.laravel_version = data.meta.laravel_version;
        this.php_version = data.meta.php_version;
        this.env = data.meta.env;
        this.running = trackerService.running(data.meta.is_running_in_console);
        this.type = trackerService.type(data.meta.type);
        this.typeGroup = trackerService.typeGroup(data.meta.type);
        this.method = trackerService.method(data.meta.method);
        this.status = trackerService.status(data.meta.status);
        this.statusGroup = trackerService.statusGroup(data.meta.status, data.meta.type);
        this.statusColor = trackerService.statusColor(data.meta.status, data.meta.type);
        this.path = trackerService.path(data.meta.path);

        this.application = new Application(data.data.application);

        this.serviceProviders = data.data.serviceProviders || [];
        this.bindings = (data.data.bindings || []).map(binding => new Binding(binding));

        this.lastActiveDetailsTab = 0;
    }

    countServiceProviders() {
        return this.serviceProviders.length;
    }

    hasServiceProviders() {
        return !! this.countServiceProviders();
    }

    countBindings() {
        return this.bindings.length;
    }

    hasBindings() {
        return !! this.countBindings();
    }
}
