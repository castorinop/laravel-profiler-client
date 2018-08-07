import { Server } from 'mock-socket';
import App from '@/App';
import Tracker from '@/models/tracker';
import { createEvent } from './../../../node_modules/mock-socket/src/event-factory';
import { trackerFactory, mountWithoutProps, mountWithSocketMock } from './test-helper';

describe('App Component', () => {
    it('has total number of loaded items', () => {
        let wrapper = mountWithoutProps(App);
        let tracker = new Tracker(trackerFactory.create());

        let wrapperFooter = wrapper.find({ name: 'app-footer' });
        expect(wrapperFooter.findAll('.container > div').at(0).text()).to.equal(wrapper.vm.$t('footer.total-items', { total: 0 }));

        wrapper.vm.$store.commit('trackers/store', tracker);
        expect(wrapperFooter.findAll('.container > div').at(0).text()).to.equal(wrapper.vm.$t('footer.total-items', { total: 1 }));

        wrapper.vm.$store.commit('trackers/store', tracker);
        wrapper.vm.$store.commit('trackers/store', tracker);
        expect(wrapperFooter.findAll('.container > div').at(0).text()).to.equal(wrapper.vm.$t('footer.total-items', { total: 3 }));
    });

    it('has state not connected before first server connection', () => {
        let wrapper = mountWithoutProps(App);
        let wrapperHeader = wrapper.find({ name: 'app-header' });
        let wrapperFooter = wrapper.find({ name: 'app-footer' });

        expect(wrapperHeader.findAll('.icon').at(1).find('.has-text-success').exists()).to.be.false;
        expect(wrapperHeader.findAll('.icon').at(1).find('.has-text-danger').exists()).to.be.true;
        expect(wrapperFooter.findAll('.container > div').at(1).text()).to.equal(wrapper.vm.$t('footer.not-connected'));
    });

    it('has state connected after first server connection', (done) => {
        let server = new Server('http://localhost:1991');
        let wrapper = mountWithSocketMock(App, 'http://localhost:1991');

        let wrapperHeader = wrapper.find({ name: 'app-header' });
        let wrapperFooter = wrapper.find({ name: 'app-footer' });

        server.on('connection', () => {
            wrapper.vm.$nextTick(() => {
                expect(wrapperHeader.findAll('.icon').at(1).find('.has-text-success').exists()).to.be.true;
                expect(wrapperHeader.findAll('.icon').at(1).find('.has-text-danger').exists()).to.be.false;
                expect(wrapperFooter.findAll('.container > div').at(1).text()).to.equal(
                    wrapper.vm.$t('footer.connected', { url: 'http://localhost:1991' })
                );
                server.stop(done);
            });
        });
    });

    it('changes state to not connected when server is down', (done) => {
        let server = new Server('http://localhost:1991');
        let wrapper = mountWithSocketMock(App, 'http://localhost:1991');

        let wrapperHeader = wrapper.find({ name: 'app-header' });
        let wrapperFooter = wrapper.find({ name: 'app-footer' });

        server.on('connection', () => {
            wrapper.vm.$nextTick(() => {
                expect(wrapperHeader.findAll('.icon').at(1).find('.has-text-success').exists()).to.be.true;
                expect(wrapperHeader.findAll('.icon').at(1).find('.has-text-danger').exists()).to.be.false;
                expect(wrapperFooter.findAll('.container > div').at(1).text()).to.equal(
                    wrapper.vm.$t('footer.connected', { url: 'http://localhost:1991' })
                );

                server.close();

                wrapper.vm.$nextTick(() => {
                    expect(wrapperHeader.findAll('.icon').at(1).find('.has-text-success').exists()).to.be.false;
                    expect(wrapperHeader.findAll('.icon').at(1).find('.has-text-danger').exists()).to.be.true;
                    expect(wrapperFooter.findAll('.container > div').at(1).text()).to.equal(wrapper.vm.$t('footer.not-connected'));
                    server.stop(done);
                });
            });
        });
    });

    it('can be disconnected by user', () => {
        let server = new Server('http://localhost:1991');
        let wrapper = mountWithSocketMock(App, 'http://localhost:1991');
        wrapper.vm.$store.commit('sockets/updateConnected', true);

        let wrapperHeader = wrapper.find({ name: 'app-header' });

        let socketDisconnect = sinon.spy(wrapper.vm.$socket.socket, 'disconnect');
        let modalOpen = sinon.spy(wrapperHeader.vm.$modal, 'open');

        wrapperHeader.findAll('.icon').at(1).trigger('click');

        expect(socketDisconnect.calledOnce).to.be.true;
        expect(modalOpen.calledOnce).to.be.false;

        wrapper.vm.$socket.socket.disconnect.restore();
        wrapperHeader.vm.$modal.open.restore();
        server.stop();
    });

    it('can be connected again by user', () => {
        let server = new Server('http://localhost:1991');
        let wrapper = mountWithSocketMock(App, 'http://localhost:1991');
        wrapper.vm.$store.commit('sockets/updateConnected', false);

        let wrapperHeader = wrapper.find({ name: 'app-header' });

        let socketDisconnect = sinon.spy(wrapper.vm.$socket.socket, 'disconnect');
        let modalOpen = sinon.mock(wrapperHeader.vm.$modal);
        modalOpen.expects('open').once();

        wrapperHeader.findAll('.icon').at(1).trigger('click');

        expect(socketDisconnect.calledOnce).to.be.true;
        modalOpen.verify();

        wrapper.vm.$socket.socket.disconnect.restore();
        modalOpen.restore();
        server.stop();
    });

    it('updates status failed connection', () => {
        let server = new Server('http://localhost:1991');
        let wrapper = mountWithSocketMock(App, 'http://localhost:1991');

        expect(wrapper.vm.$store.state.sockets.connectErrorCount).to.equal(0);
        wrapper.vm.$socket.socket.dispatchEvent(createEvent({ type: 'connect_error', target: wrapper.vm.$socket.socket }));
        expect(wrapper.vm.$store.state.sockets.connectErrorCount).to.equal(1);

        server.stop();
    });
});
