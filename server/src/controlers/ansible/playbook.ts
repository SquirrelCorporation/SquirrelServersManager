import express from "express";
import ansible from '../../shell/ansible'
const router = express.Router();

router.get(`/playbooks`, async (req, res) => {
    try {
        const listOfPlaybooks = await ansible.listPlaybooks();
        const listOfPlaybooksToSelect = listOfPlaybooks.map(e => {
            return {value: e, label: e.replaceAll('.yml', '')};
        })
        res.send({
            success: true,
            data: listOfPlaybooksToSelect
        })
    } catch (error) {
        res.status(500).send({
            success: false
        })
    }
});

export default router;
